class GrowEnvironmentCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.showingHistory = null;
    this.historyData = {};
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('Please define entities');
    }
    this.config = {
      ...config,
      title: config.title || 'Environment',
      history_hours: config.history_hours || 24
    };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  async fetchHistory(entityId) {
    if (this.historyData[entityId]) return this.historyData[entityId];
    
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.config.history_hours * 60 * 60 * 1000);
    
    try {
      const history = await this._hass.callApi('GET', 
        `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}`
      );
      this.historyData[entityId] = history[0] || [];
      return this.historyData[entityId];
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
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px;
        }
        .metric-card {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          pointer-events: none;
        }
        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        .metric-card.temperature {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
        }
        .metric-card.humidity {
          background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
        }
        .metric-card.co2 {
          background: linear-gradient(135deg, #A8E6CF 0%, #56AB91 100%);
        }
        .metric-card.vpd {
          background: linear-gradient(135deg, #FFD93D 0%, #F6C90E 100%);
        }
        .modal-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .modal-overlay.show {
          display: flex;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-content {
          background: var(--card-background-color);
          border-radius: 16px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--primary-text-color);
        }
        .modal-close {
          background: var(--secondary-background-color);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: var(--primary-color);
          color: white;
        }
        .modal-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .modal-stat {
          text-align: center;
          padding: 12px;
          background: var(--secondary-background-color);
          border-radius: 8px;
        }
        .modal-stat-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
        }
        .modal-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary-color);
        }
        .metric-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 32px;
          font-weight: 800;
          color: white;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .metric-unit {
          font-size: 16px;
          font-weight: 600;
          margin-left: 4px;
          opacity: 0.9;
        }
        .metric-icon {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 24px;
          opacity: 0.3;
        }
        .history-view {
          display: none;
          padding: 16px;
          background: var(--card-background-color);
        }
        .history-view.active {
          display: block;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .history-title {
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
          transition: all 0.2s;
        }
        .back-button:hover {
          opacity: 0.8;
        }
        canvas {
          width: 100%;
          height: 200px;
          border-radius: 8px;
          background: var(--secondary-background-color);
        }
        .no-data {
          text-align: center;
          padding: 40px;
          color: var(--secondary-text-color);
        }
      </style>
      <ha-card>
        <div class="card-header">${this.config.title}</div>
        <div class="metrics-grid" id="metrics-grid"></div>
      </ha-card>
      
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title" id="modal-title"></div>
            <button class="modal-close" id="modal-close">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="modal-stats" id="modal-stats"></div>
          <canvas id="modal-canvas" width="600" height="300"></canvas>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('modal-close').addEventListener('click', () => {
      this.closeModal();
    });
    
    this.shadowRoot.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') {
        this.closeModal();
      }
    });
  }

  updateCard() {
    if (!this._hass) return;

    const grid = this.shadowRoot.getElementById('metrics-grid');
    const metrics = [];

    if (this.config.entities.temperature) {
      metrics.push(this.createMetric('temperature', 'Temperature', '°C', '🌡️'));
    }
    if (this.config.entities.humidity) {
      metrics.push(this.createMetric('humidity', 'Humidity', '%', '💧'));
    }
    if (this.config.entities.co2) {
      metrics.push(this.createMetric('co2', 'CO₂', 'ppm', '🌱'));
    }
    if (this.config.entities.vpd) {
      metrics.push(this.createMetric('vpd', 'VPD', 'kPa', '📊'));
    }

    grid.innerHTML = metrics.join('');

    // Add click handlers
    grid.querySelectorAll('.metric-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.type;
        this.showHistory(type);
      });
    });
  }

  createMetric(type, label, unit, icon) {
    const entity = this._hass.states[this.config.entities[type]];
    const value = entity ? parseFloat(entity.state).toFixed(type === 'co2' ? 0 : 1) : '--';

    return `
      <div class="metric-card ${type}" data-type="${type}">
        <div class="metric-icon">${icon}</div>
        <div class="metric-label">${label}</div>
        <div class="metric-value">
          ${value}<span class="metric-unit">${unit}</span>
        </div>
      </div>
    `;
  }

  async showHistory(type) {
    const entityId = this.config.entities[type];
    if (!entityId) return;

    const modal = this.shadowRoot.getElementById('modal-overlay');
    const modalTitle = this.shadowRoot.getElementById('modal-title');
    const modalStats = this.shadowRoot.getElementById('modal-stats');

    const labels = {
      temperature: 'Temperature History',
      humidity: 'Humidity History',
      co2: 'CO₂ History',
      vpd: 'VPD History'
    };
    modalTitle.textContent = labels[type];

    // Show modal
    modal.classList.add('show');

    // Fetch and display history
    const history = await this.fetchHistory(entityId);
    this.displayModalStats(history, type);
    this.drawModalChart(history, type);
  }

  closeModal() {
    const modal = this.shadowRoot.getElementById('modal-overlay');
    modal.classList.remove('show');
  }

  displayModalStats(history, type) {
    const statsContainer = this.shadowRoot.getElementById('modal-stats');
    
    if (!history || history.length === 0) {
      statsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No data available</div>';
      return;
    }

    const values = history.map(h => parseFloat(h.state)).filter(v => !isNaN(v));
    const current = values[values.length - 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    const units = {
      temperature: '°C',
      humidity: '%',
      co2: 'ppm',
      vpd: 'kPa'
    };
    const unit = units[type] || '';
    const decimals = type === 'co2' ? 0 : type === 'vpd' ? 2 : 1;

    statsContainer.innerHTML = `
      <div class="modal-stat">
        <div class="modal-stat-label">Current</div>
        <div class="modal-stat-value">${current.toFixed(decimals)}${unit}</div>
      </div>
      <div class="modal-stat">
        <div class="modal-stat-label">Min</div>
        <div class="modal-stat-value">${min.toFixed(decimals)}${unit}</div>
      </div>
      <div class="modal-stat">
        <div class="modal-stat-label">Max</div>
        <div class="modal-stat-value">${max.toFixed(decimals)}${unit}</div>
      </div>
      <div class="modal-stat">
        <div class="modal-stat-label">Average</div>
        <div class="modal-stat-value">${avg.toFixed(decimals)}${unit}</div>
      </div>
    `;
  }

  drawHistoryChart(history, type) {
    const canvas = this.shadowRoot.getElementById('history-canvas');
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

      // Y-axis labels
      const value = maxValue - (i / 4) * valueRange;
      ctx.fillStyle = '#666';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding - 5, y + 4);
    }

    // Draw line
    const colors = {
      temperature: '#FF6B6B',
      humidity: '#4ECDC4',
      co2: '#56AB91',
      vpd: '#FFD93D'
    };

    ctx.beginPath();
    ctx.strokeStyle = colors[type] || '#4ECDC4';
    ctx.lineWidth = 2;

    dataPoints.forEach((point, i) => {
      const x = padding + ((point.time - minTime) / timeRange) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw points
    dataPoints.forEach(point => {
      const x = padding + ((point.time - minTime) / timeRange) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = colors[type] || '#4ECDC4';
      ctx.fill();
    });

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
    return 3;
  }

  static getStubConfig() {
    return {
      entities: {
        temperature: 'sensor.temperature',
        humidity: 'sensor.humidity',
        co2: 'sensor.co2',
        vpd: 'sensor.vpd'
      },
      title: 'Environment'
    };
  }
}

customElements.define('grow-environment-card', GrowEnvironmentCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-environment-card',
  name: 'Grow Environment Card',
  description: 'Monitor temperature, humidity, CO2, and VPD with history graphs'
});
