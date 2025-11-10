class GrowIrrigationCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.showingGraph = null;
  }

  setConfig(config) {
    if (!config.zones || config.zones.length === 0) {
      throw new Error('Please define at least one zone');
    }
    this.config = {
      ...config,
      title: config.title || 'Irrigation Control',
      history_hours: config.history_hours || 24
    };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  async fetchHistory(entityId) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.config.history_hours * 60 * 60 * 1000);
    
    try {
      const history = await this._hass.callApi('GET', 
        `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}`
      );
      return history[0] || [];
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return [];
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          padding: 0;
          overflow: hidden;
          background: var(--card-background-color);
        }
        .card-header {
          font-size: 20px;
          font-weight: 500;
          padding: 16px;
          color: var(--primary-text-color);
          border-bottom: 1px solid var(--divider-color);
        }
        .zones-container {
          padding: 16px;
        }
        .zone {
          background: var(--secondary-background-color);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .zone:hover {
          border-color: var(--primary-color);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .zone.active {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1));
          border-color: #4CAF50;
        }
        .zone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .zone-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .zone-toggle {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .zone-toggle:hover {
          opacity: 0.8;
        }
        .zone-toggle.active {
          background: #4CAF50;
        }
        .zone-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }
        .metric {
          text-align: center;
          padding: 8px;
          background: var(--card-background-color);
          border-radius: 8px;
        }
        .metric-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary-text-color);
        }
        .metric-unit {
          font-size: 12px;
          margin-left: 2px;
          opacity: 0.7;
        }
        .graph-buttons {
          display: flex;
          gap: 8px;
        }
        .graph-button {
          flex: 1;
          background: var(--secondary-background-color);
          border: 1px solid var(--divider-color);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          color: var(--primary-text-color);
          transition: all 0.2s;
        }
        .graph-button:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .graph-view {
          display: none;
          padding: 16px;
        }
        .graph-view.active {
          display: block;
        }
        .graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .graph-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .back-button {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        canvas {
          width: 100%;
          height: 200px;
          border-radius: 8px;
          background: var(--secondary-background-color);
        }
      </style>
      <ha-card>
        <div class="main-view" id="main-view">
          <div class="card-header">${this.config.title}</div>
          <div class="zones-container" id="zones-container"></div>
        </div>
        <div class="graph-view" id="graph-view">
          <div class="graph-header">
            <div class="graph-title" id="graph-title"></div>
            <button class="back-button" id="back-button">Back</button>
          </div>
          <canvas id="graph-canvas"></canvas>
        </div>
      </ha-card>
    `;

    this.shadowRoot.getElementById('back-button').addEventListener('click', () => {
      this.showMainView();
    });
  }

  updateCard() {
    if (!this._hass) return;

    const container = this.shadowRoot.getElementById('zones-container');
    const zones = this.config.zones.map(zone => this.createZone(zone)).join('');
    container.innerHTML = zones;

    // Add toggle handlers
    container.querySelectorAll('.zone-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const entityId = btn.dataset.entity;
        this._hass.callService('homeassistant', 'toggle', {
          entity_id: entityId
        });
      });
    });

    // Add graph button handlers
    container.querySelectorAll('.graph-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const zoneId = btn.dataset.zone;
        const type = btn.dataset.type;
        this.showGraph(zoneId, type);
      });
    });
  }

  createZone(zone) {
    const entity = this._hass.states[zone.entity];
    if (!entity) return '';

    const isActive = entity.state === 'on';
    
    // Get sensor values
    const vwc = zone.vwc_sensor ? this._hass.states[zone.vwc_sensor] : null;
    const ec = zone.ec_sensor ? this._hass.states[zone.ec_sensor] : null;

    return `
      <div class="zone ${isActive ? 'active' : ''}" data-zone="${zone.entity}">
        <div class="zone-header">
          <div class="zone-name">${zone.name || entity.attributes.friendly_name}</div>
          <button class="zone-toggle ${isActive ? 'active' : ''}" data-entity="${zone.entity}">
            ${isActive ? '⏸ Stop' : '▶ Start'}
          </button>
        </div>
        ${vwc || ec ? `
          <div class="zone-metrics">
            ${vwc ? `
              <div class="metric">
                <div class="metric-label">VWC</div>
                <div class="metric-value">
                  ${parseFloat(vwc.state).toFixed(1)}<span class="metric-unit">%</span>
                </div>
              </div>
            ` : ''}
            ${ec ? `
              <div class="metric">
                <div class="metric-label">EC</div>
                <div class="metric-value">
                  ${parseFloat(ec.state).toFixed(2)}<span class="metric-unit">mS/cm</span>
                </div>
              </div>
            ` : ''}
          </div>
          <div class="graph-buttons">
            ${vwc ? `<button class="graph-button" data-zone="${zone.entity}" data-type="vwc">📊 VWC History</button>` : ''}
            ${ec ? `<button class="graph-button" data-zone="${zone.entity}" data-type="ec">📊 EC History</button>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  async showGraph(zoneId, type) {
    const zone = this.config.zones.find(z => z.entity === zoneId);
    if (!zone) return;

    const entityId = type === 'vwc' ? zone.vwc_sensor : zone.ec_sensor;
    if (!entityId) return;

    this.showingGraph = { zone, type, entityId };
    
    const mainView = this.shadowRoot.getElementById('main-view');
    const graphView = this.shadowRoot.getElementById('graph-view');
    const graphTitle = this.shadowRoot.getElementById('graph-title');

    mainView.style.display = 'none';
    graphView.classList.add('active');

    const labels = {
      vwc: 'Volumetric Water Content',
      ec: 'Electrical Conductivity'
    };
    graphTitle.textContent = `${zone.name} - ${labels[type]}`;

    const history = await this.fetchHistory(entityId);
    this.drawGraph(history, type);
  }

  showMainView() {
    const mainView = this.shadowRoot.getElementById('main-view');
    const graphView = this.shadowRoot.getElementById('graph-view');

    mainView.style.display = 'block';
    graphView.classList.remove('active');
    this.showingGraph = null;
  }

  drawGraph(history, type) {
    const canvas = this.shadowRoot.getElementById('graph-canvas');
    if (!canvas || !history || history.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);

    const width = canvas.offsetWidth;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Get data points
    const dataPoints = history.map(h => ({
      time: new Date(h.last_changed).getTime(),
      value: parseFloat(h.state)
    })).filter(p => !isNaN(p.value));

    if (dataPoints.length === 0) return;

    const values = dataPoints.map(p => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    const minTime = dataPoints[0].time;
    const maxTime = dataPoints[dataPoints.length - 1].time;
    const timeRange = maxTime - minTime || 1;

    // Draw grid
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();

      const value = maxValue - (i / 4) * valueRange;
      ctx.fillStyle = '#666';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(type === 'vwc' ? 1 : 2), padding - 5, y + 4);
    }

    // Draw line
    const colors = {
      vwc: '#2196F3',
      ec: '#FF9800'
    };

    ctx.beginPath();
    ctx.strokeStyle = colors[type] || '#2196F3';
    ctx.lineWidth = 2;

    dataPoints.forEach((point, i) => {
      const x = padding + ((point.time - minTime) / timeRange) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw area fill
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    ctx.fillStyle = colors[type] + '20';
    ctx.fill();

    // Draw time labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i / 4) * chartWidth;
      const time = new Date(minTime + (i / 4) * timeRange);
      ctx.fillText(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), x, height - 5);
    }
  }

  getCardSize() {
    return 4;
  }

  static getStubConfig() {
    return {
      zones: [
        {
          entity: 'switch.irrigation_zone_1',
          name: 'Zone 1',
          vwc_sensor: 'sensor.zone_1_vwc',
          ec_sensor: 'sensor.zone_1_ec'
        }
      ],
      title: 'Irrigation Control'
    };
  }
}

customElements.define('grow-irrigation-card', GrowIrrigationCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-irrigation-card',
  name: 'Grow Irrigation Card',
  description: 'Control irrigation zones with VWC and EC monitoring'
});
