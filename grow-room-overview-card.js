class GrowRoomOverviewCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.room_name) {
      throw new Error('Please define room_name');
    }
    
    this.config = {
      ...config,
      title: config.title || config.room_name,
      // Required entities
      stage_entity: config.stage_entity,
      start_date_entity: config.start_date_entity,
      lights_entity: config.lights_entity,
      temperature_entity: config.temperature_entity,
      humidity_entity: config.humidity_entity,
      vpd_entity: config.vpd_entity,
      co2_entity: config.co2_entity,
      // Optional entities
      leaf_vpd_entity: config.leaf_vpd_entity,
      last_watering_entity: config.last_watering_entity,
      alert_entities: config.alert_entities || [],
      // Settings
      show_sparklines: config.show_sparklines !== false,
      light_hours: config.light_hours || 12
    };
    
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          padding: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
        }
        .card-header {
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }
        .room-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .room-icon {
          font-size: 32px;
        }
        .stage-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          font-size: 14px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-label {
          font-size: 12px;
          opacity: 0.8;
          font-weight: 500;
        }
        .info-value {
          font-size: 16px;
          font-weight: 700;
        }
        .lights-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          background: rgba(255, 193, 7, 0.2);
          font-weight: 700;
        }
        .lights-status.on {
          background: rgba(255, 193, 7, 0.3);
          color: #FFC107;
        }
        .lights-status.off {
          background: rgba(158, 158, 158, 0.3);
          color: #9E9E9E;
        }
        .section {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          opacity: 0.9;
        }
        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .metric-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }
        .metric-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .metric-icon {
          font-size: 24px;
          width: 32px;
          text-align: center;
        }
        .metric-label {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
        }
        .metric-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .metric-value {
          font-size: 18px;
          font-weight: 700;
          min-width: 80px;
          text-align: right;
        }
        .sparkline {
          width: 120px;
          height: 32px;
        }
        .day-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 193, 7, 0.15);
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .day-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
        }
        .day-value {
          font-size: 16px;
          font-weight: 700;
        }
        .watering-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(33, 150, 243, 0.15);
          border-radius: 8px;
        }
        .watering-icon {
          font-size: 20px;
        }
        .watering-text {
          font-size: 14px;
          font-weight: 600;
        }
        .alerts-section {
          padding: 16px 20px;
        }
        .alert-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(76, 175, 80, 0.2);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }
        .alert-item.warning {
          background: rgba(255, 152, 0, 0.2);
          color: #FFB74D;
        }
        .alert-item.critical {
          background: rgba(244, 67, 54, 0.2);
          color: #EF5350;
          animation: pulse 2s infinite;
        }
        .alert-icon {
          font-size: 20px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .metric-row.temp { color: #4CAF50; }
        .metric-row.humidity { color: #2196F3; }
        .metric-row.vpd { color: #9C27B0; }
        .metric-row.leaf-vpd { color: #8BC34A; }
        .metric-row.co2 { color: #00BCD4; }
      </style>
      <ha-card>
        <div class="card-header">
          <div class="room-title">
            <span class="room-icon">🌸</span>
            <span id="room-name">${this.config.title}</span>
          </div>
          <div class="stage-info">
            <div class="info-item">
              <span class="info-label">Stage:</span>
              <span class="info-value" id="stage">Loading...</span>
            </div>
            <div class="info-item">
              <span class="info-label">Day</span>
              <span class="info-value" id="day-week">Loading...</span>
            </div>
            <div class="info-item">
              <span class="info-label">Start Date:</span>
              <span class="info-value" id="start-date">Loading...</span>
            </div>
            <div class="info-item">
              <span class="info-label">Lights:</span>
              <span class="lights-status" id="lights-status">
                <span id="lights-icon">💡</span>
                <span id="lights-text">OFF</span>
              </span>
            </div>
          </div>
        </div>

        <div class="section" id="watering-section"></div>

        <div class="section" id="alerts-section"></div>

        <div class="section">
          <div class="day-info">
            <div class="day-label">
              <span>☀️</span>
              <span>Day</span>
            </div>
            <div class="day-value" id="current-day">Day 19 | Week 3</div>
          </div>

          <div class="metrics-grid" id="metrics-grid"></div>
        </div>
      </ha-card>
    `;
  }

  updateCard() {
    if (!this._hass) return;

    this.updateStageInfo();
    this.updateMetrics();
    this.updateWatering();
    this.updateAlerts();
  }

  updateStageInfo() {
    const stageEl = this.shadowRoot.getElementById('stage');
    const dayWeekEl = this.shadowRoot.getElementById('day-week');
    const startDateEl = this.shadowRoot.getElementById('start-date');
    const lightsStatusEl = this.shadowRoot.getElementById('lights-status');
    const lightsIconEl = this.shadowRoot.getElementById('lights-icon');
    const lightsTextEl = this.shadowRoot.getElementById('lights-text');
    const currentDayEl = this.shadowRoot.getElementById('current-day');

    // Stage
    if (this.config.stage_entity) {
      const stageEntity = this._hass.states[this.config.stage_entity];
      stageEl.textContent = stageEntity ? stageEntity.state : 'Unknown';
    } else {
      stageEl.textContent = 'Flowering';
    }

    // Calculate day and week
    if (this.config.start_date_entity) {
      const startDateEntity = this._hass.states[this.config.start_date_entity];
      if (startDateEntity && startDateEntity.state !== 'unavailable') {
        const startDate = new Date(startDateEntity.state);
        const now = new Date();
        const diffTime = Math.abs(now - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const week = Math.ceil(diffDays / 7);
        
        dayWeekEl.textContent = `${diffDays} | Week ${week}`;
        currentDayEl.textContent = `Day ${diffDays} | Week ${week}`;
        startDateEl.textContent = startDate.toLocaleDateString();
      }
    }

    // Lights status
    if (this.config.lights_entity) {
      const lightsEntity = this._hass.states[this.config.lights_entity];
      const isOn = lightsEntity && lightsEntity.state === 'on';
      
      lightsStatusEl.className = `lights-status ${isOn ? 'on' : 'off'}`;
      lightsIconEl.textContent = isOn ? '💡' : '🌑';
      lightsTextEl.textContent = isOn ? 'ON' : 'OFF';
    }
  }

  updateMetrics() {
    const metricsGrid = this.shadowRoot.getElementById('metrics-grid');
    
    const metrics = [
      {
        id: 'temp',
        icon: '🌡️',
        label: 'Temp',
        entity: this.config.temperature_entity,
        unit: '°C',
        decimals: 2,
        class: 'temp'
      },
      {
        id: 'humidity',
        icon: '💧',
        label: 'RH',
        entity: this.config.humidity_entity,
        unit: '%',
        decimals: 2,
        class: 'humidity'
      },
      {
        id: 'vpd',
        icon: '🌿',
        label: 'Room VPD',
        entity: this.config.vpd_entity,
        unit: 'kPa',
        decimals: 2,
        class: 'vpd'
      },
      {
        id: 'leaf-vpd',
        icon: '🍃',
        label: 'Leaf VPD',
        entity: this.config.leaf_vpd_entity,
        unit: 'kPa',
        decimals: 2,
        class: 'leaf-vpd'
      },
      {
        id: 'co2',
        icon: '💨',
        label: 'CO2',
        entity: this.config.co2_entity,
        unit: 'ppm',
        decimals: 0,
        class: 'co2'
      }
    ];

    metricsGrid.innerHTML = metrics
      .filter(m => m.entity)
      .map(metric => {
        const entity = this._hass.states[metric.entity];
        const value = entity ? parseFloat(entity.state) : 0;
        const displayValue = value.toFixed(metric.decimals);

        return `
          <div class="metric-row ${metric.class}">
            <div class="metric-left">
              <span class="metric-icon">${metric.icon}</span>
              <span class="metric-label">${metric.label}</span>
            </div>
            <div class="metric-right">
              ${this.config.show_sparklines ? `<canvas class="sparkline" data-entity="${metric.entity}"></canvas>` : ''}
              <span class="metric-value">${displayValue} ${metric.unit}</span>
            </div>
          </div>
        `;
      })
      .join('');

    if (this.config.show_sparklines) {
      this.drawSparklines();
    }
  }

  async drawSparklines() {
    const canvases = this.shadowRoot.querySelectorAll('.sparkline');
    
    for (const canvas of canvases) {
      const entityId = canvas.dataset.entity;
      const history = await this.fetchHistory(entityId, 24);
      
      if (history && history.length > 0) {
        this.drawSparkline(canvas, history);
      }
    }
  }

  async fetchHistory(entityId, hours = 24) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
    
    try {
      const history = await this._hass.callApi('GET', `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}`);
      return history[0] || [];
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  drawSparkline(canvas, history) {
    const ctx = canvas.getContext('2d');
    const width = 120;
    const height = 32;
    
    canvas.width = width;
    canvas.height = height;

    const dataPoints = history
      .map(h => parseFloat(h.state))
      .filter(v => !isNaN(v));

    if (dataPoints.length < 2) return;

    const minValue = Math.min(...dataPoints);
    const maxValue = Math.max(...dataPoints);
    const valueRange = maxValue - minValue || 1;

    ctx.clearRect(0, 0, width, height);

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
    ctx.lineWidth = 2;

    dataPoints.forEach((value, i) => {
      const x = (i / (dataPoints.length - 1)) * width;
      const y = height - ((value - minValue) / valueRange) * height;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw area fill
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
    ctx.fill();
  }

  updateWatering() {
    const wateringSection = this.shadowRoot.getElementById('watering-section');
    
    if (!this.config.last_watering_entity) {
      wateringSection.style.display = 'none';
      return;
    }

    const wateringEntity = this._hass.states[this.config.last_watering_entity];
    if (!wateringEntity) {
      wateringSection.style.display = 'none';
      return;
    }

    const lastChanged = new Date(wateringEntity.last_changed);
    const now = new Date();
    const hoursAgo = Math.floor((now - lastChanged) / (1000 * 60 * 60));
    
    wateringSection.innerHTML = `
      <div class="section-title">Last Watering Event</div>
      <div class="watering-info">
        <span class="watering-icon">💧</span>
        <span class="watering-text">${hoursAgo} hours ago</span>
      </div>
    `;
  }

  updateAlerts() {
    const alertsSection = this.shadowRoot.getElementById('alerts-section');
    
    const alerts = [];
    
    // Check configured alert entities
    if (this.config.alert_entities && this.config.alert_entities.length > 0) {
      this.config.alert_entities.forEach(entityId => {
        const entity = this._hass.states[entityId];
        if (entity && (entity.state === 'on' || entity.state === 'true')) {
          alerts.push({
            severity: 'warning',
            message: entity.attributes.friendly_name || 'Alert Active'
          });
        }
      });
    }

    if (alerts.length === 0) {
      alertsSection.innerHTML = `
        <div class="section-title">System Alerts</div>
        <div class="alert-item">
          <span class="alert-icon">✅</span>
          <span>**All Systems Nominal**</span>
        </div>
      `;
    } else {
      const alertsHTML = alerts.map(alert => `
        <div class="alert-item ${alert.severity}">
          <span class="alert-icon">${alert.severity === 'critical' ? '🚨' : '⚠️'}</span>
          <span>${alert.message}</span>
        </div>
      `).join('');

      alertsSection.innerHTML = `
        <div class="section-title">System Alerts</div>
        ${alertsHTML}
      `;
    }
  }

  getCardSize() {
    return 6;
  }
}

customElements.define('grow-room-overview-card', GrowRoomOverviewCard);
