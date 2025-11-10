class GrowAlertCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.snoozedAlerts = new Set();
    this.acknowledgedAlerts = new Set();
    this.lastCriticalAlertCount = 0;
  }

  setConfig(config) {
    if (!config.rooms || config.rooms.length === 0) {
      throw new Error('Please define at least one room');
    }
    
    this.config = {
      ...config,
      title: config.title || 'Alert Manager',
      show_history: config.show_history !== false,
      alert_entities: config.alert_entities || [],
      notification_service: config.notification_service
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
          background: var(--card-background-color);
        }
        .card-header {
          font-size: 20px;
          font-weight: 500;
          padding: 16px;
          color: var(--primary-text-color);
          border-bottom: 1px solid var(--divider-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .alert-count {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 700;
        }
        .alert-count.critical {
          background: #F44336;
          color: white;
          animation: pulse 1s infinite;
        }
        .alert-count.warning {
          background: #FF9800;
          color: white;
        }
        .alert-count.clear {
          background: #4CAF50;
          color: white;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--divider-color);
          background: var(--secondary-background-color);
        }
        .tab {
          flex: 1;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          font-weight: 600;
          color: var(--secondary-text-color);
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
        }
        .tab:hover {
          background: var(--card-background-color);
        }
        .tab.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        .alerts-container {
          padding: 16px;
          max-height: 500px;
          overflow-y: auto;
        }
        .alert-item {
          background: var(--secondary-background-color);
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 12px;
          border-left: 4px solid;
          transition: all 0.2s;
        }
        .alert-item:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .alert-item.critical {
          border-left-color: #F44336;
          background: rgba(244, 67, 54, 0.05);
        }
        .alert-item.warning {
          border-left-color: #FF9800;
          background: rgba(255, 152, 0, 0.05);
        }
        .alert-item.info {
          border-left-color: #2196F3;
          background: rgba(33, 150, 243, 0.05);
        }
        .alert-item.snoozed {
          opacity: 0.5;
        }
        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .alert-title {
          font-weight: 600;
          font-size: 15px;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .alert-room {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          background: var(--divider-color);
          color: var(--primary-text-color);
          font-weight: 600;
          text-transform: uppercase;
        }
        .alert-message {
          font-size: 13px;
          color: var(--secondary-text-color);
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .alert-time {
          font-size: 11px;
          color: var(--secondary-text-color);
          opacity: 0.7;
        }
        .alert-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .alert-action-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .alert-action-btn.acknowledge {
          background: var(--primary-color);
          color: white;
        }
        .alert-action-btn.snooze {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color);
        }
        .alert-action-btn:hover {
          opacity: 0.8;
        }
        .no-alerts {
          text-align: center;
          padding: 60px 20px;
          color: var(--secondary-text-color);
        }
        .no-alerts ha-icon {
          font-size: 64px;
          color: #4CAF50;
          margin-bottom: 16px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px;
          background: var(--secondary-background-color);
        }
        .summary-box {
          padding: 14px;
          border-radius: 10px;
          text-align: center;
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .summary-box.critical {
          background: linear-gradient(135deg, #F44336, #D32F2F);
        }
        .summary-box.warning {
          background: linear-gradient(135deg, #FF9800, #F57C00);
        }
        .summary-box.info {
          background: linear-gradient(135deg, #2196F3, #1976D2);
        }
        .summary-box.total {
          background: linear-gradient(135deg, #9C27B0, #7B1FA2);
        }
        .summary-label {
          font-size: 11px;
          opacity: 0.9;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 600;
        }
        .summary-value {
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .history-item {
          padding: 12px;
          border-bottom: 1px solid var(--divider-color);
          font-size: 13px;
        }
        .history-item:last-child {
          border-bottom: none;
        }
        .history-time {
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 4px;
        }
        .history-message {
          color: var(--secondary-text-color);
        }
        .filter-buttons {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: var(--secondary-background-color);
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 6px 12px;
          border-radius: 16px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .filter-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .filter-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      </style>
      <ha-card>
        <div class="card-header">
          <span>${this.config.title}</span>
          <div id="alert-count-badge"></div>
        </div>

        <div class="summary-grid" id="summary-grid"></div>

        <div class="tabs">
          <div class="tab active" id="tab-active" data-tab="active">Active</div>
          <div class="tab" id="tab-snoozed" data-tab="snoozed">Snoozed</div>
          ${this.config.show_history ? '<div class="tab" id="tab-history" data-tab="history">History</div>' : ''}
        </div>

        <div class="filter-buttons" id="filter-buttons"></div>

        <div class="alerts-container" id="alerts-container"></div>
      </ha-card>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Tab switching
    this.shadowRoot.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.shadowRoot.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentTab = e.target.dataset.tab;
        this.updateCard();
      });
    });

    this.currentTab = 'active';
    this.currentFilter = 'all';
  }

  updateCard() {
    if (!this._hass) return;

    const alerts = this.collectAlerts();
    this.checkForNewCriticalAlerts(alerts);
    this.updateSummary(alerts);
    this.updateAlertCount(alerts);
    this.updateFilters(alerts);
    this.displayAlerts(alerts);
  }

  checkForNewCriticalAlerts(alerts) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !this.snoozedAlerts.has(a.id) && !this.acknowledgedAlerts.has(a.id));
    const currentCriticalCount = criticalAlerts.length;
    
    // Play sound if new critical alerts appeared
    if (currentCriticalCount > this.lastCriticalAlertCount && this.config.enable_sound !== false) {
      this.playAlertSound();
    }
    
    this.lastCriticalAlertCount = currentCriticalCount;
  }

  playAlertSound() {
    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Could not play alert sound:', e);
    }
  }

  collectAlerts() {
    const alerts = [];

    // Collect alerts from configured entities
    this.config.alert_entities.forEach(entityId => {
      const entity = this._hass.states[entityId];
      if (!entity) return;

      if (entity.state === 'on' || entity.state === 'true') {
        const room = this.getRoomFromEntity(entityId);
        alerts.push({
          id: entityId,
          room: room,
          title: entity.attributes.friendly_name || entityId,
          message: entity.attributes.message || 'Alert triggered',
          severity: this.getSeverity(entity),
          timestamp: new Date(entity.last_changed),
          entity: entityId
        });
      }
    });

    // Auto-detect alerts from rooms
    this.config.rooms.forEach(room => {
      // Check for common alert patterns
      Object.keys(this._hass.states).forEach(entityId => {
        if (entityId.includes(room.toLowerCase().replace(/\s+/g, '_'))) {
          const entity = this._hass.states[entityId];
          
          // Check for binary sensors that are "on"
          if (entityId.startsWith('binary_sensor.') && entity.state === 'on') {
            if (entityId.includes('alert') || entityId.includes('warning') || 
                entityId.includes('high') || entityId.includes('low') ||
                entityId.includes('leak') || entityId.includes('problem')) {
              
              alerts.push({
                id: entityId,
                room: room,
                title: entity.attributes.friendly_name || entityId,
                message: this.generateAlertMessage(entity),
                severity: this.getSeverity(entity),
                timestamp: new Date(entity.last_changed),
                entity: entityId
              });
            }
          }
        }
      });
    });

    // Remove duplicates and snoozed
    const uniqueAlerts = alerts.filter((alert, index, self) =>
      index === self.findIndex(a => a.id === alert.id)
    );

    return uniqueAlerts;
  }

  getRoomFromEntity(entityId) {
    for (const room of this.config.rooms) {
      if (entityId.toLowerCase().includes(room.toLowerCase().replace(/\s+/g, '_'))) {
        return room;
      }
    }
    return 'Unknown';
  }

  getSeverity(entity) {
    const entityId = entity.entity_id.toLowerCase();
    const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();
    
    if (entityId.includes('critical') || friendlyName.includes('critical') ||
        entityId.includes('leak') || entityId.includes('fire')) {
      return 'critical';
    } else if (entityId.includes('warning') || friendlyName.includes('warning') ||
               entityId.includes('high') || entityId.includes('low')) {
      return 'warning';
    }
    return 'info';
  }

  generateAlertMessage(entity) {
    const entityId = entity.entity_id;
    
    if (entityId.includes('temperature')) {
      return `Temperature is ${entity.state === 'on' ? 'out of range' : 'normal'}`;
    } else if (entityId.includes('humidity')) {
      return `Humidity is ${entity.state === 'on' ? 'out of range' : 'normal'}`;
    } else if (entityId.includes('vpd')) {
      return `VPD is ${entity.state === 'on' ? 'out of range' : 'normal'}`;
    } else if (entityId.includes('leak')) {
      return 'Water leak detected!';
    } else if (entityId.includes('co2')) {
      return `CO2 level is ${entity.state === 'on' ? 'abnormal' : 'normal'}`;
    }
    
    return entity.attributes.message || 'Alert condition detected';
  }

  updateSummary(alerts) {
    const summary = {
      critical: alerts.filter(a => a.severity === 'critical' && !this.snoozedAlerts.has(a.id)).length,
      warning: alerts.filter(a => a.severity === 'warning' && !this.snoozedAlerts.has(a.id)).length,
      info: alerts.filter(a => a.severity === 'info' && !this.snoozedAlerts.has(a.id)).length,
      total: alerts.filter(a => !this.snoozedAlerts.has(a.id)).length
    };

    const grid = this.shadowRoot.getElementById('summary-grid');
    grid.innerHTML = `
      <div class="summary-box critical">
        <div class="summary-label">Critical</div>
        <div class="summary-value">${summary.critical}</div>
      </div>
      <div class="summary-box warning">
        <div class="summary-label">Warning</div>
        <div class="summary-value">${summary.warning}</div>
      </div>
      <div class="summary-box info">
        <div class="summary-label">Info</div>
        <div class="summary-value">${summary.info}</div>
      </div>
      <div class="summary-box total">
        <div class="summary-label">Total</div>
        <div class="summary-value">${summary.total}</div>
      </div>
    `;
  }

  updateAlertCount(alerts) {
    const activeAlerts = alerts.filter(a => !this.snoozedAlerts.has(a.id));
    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
    const badge = this.shadowRoot.getElementById('alert-count-badge');

    if (activeAlerts.length === 0) {
      badge.innerHTML = '<span class="alert-count clear"><ha-icon icon="mdi:check-circle"></ha-icon> All Clear</span>';
    } else if (criticalCount > 0) {
      badge.innerHTML = `<span class="alert-count critical"><ha-icon icon="mdi:alert"></ha-icon> ${activeAlerts.length} Active</span>`;
    } else {
      badge.innerHTML = `<span class="alert-count warning"><ha-icon icon="mdi:alert-circle"></ha-icon> ${activeAlerts.length} Active</span>`;
    }
  }

  updateFilters(alerts) {
    const rooms = [...new Set(alerts.map(a => a.room))];
    const filterContainer = this.shadowRoot.getElementById('filter-buttons');

    let html = '<button class="filter-btn active" data-filter="all">All Rooms</button>';
    rooms.forEach(room => {
      html += `<button class="filter-btn" data-filter="${room}">${room}</button>`;
    });

    filterContainer.innerHTML = html;

    // Add filter event listeners
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.displayAlerts(alerts);
      });
    });
  }

  displayAlerts(alerts) {
    const container = this.shadowRoot.getElementById('alerts-container');

    let filteredAlerts = alerts;

    // Filter by tab
    if (this.currentTab === 'active') {
      filteredAlerts = alerts.filter(a => !this.snoozedAlerts.has(a.id));
    } else if (this.currentTab === 'snoozed') {
      filteredAlerts = alerts.filter(a => this.snoozedAlerts.has(a.id));
    }

    // Filter by room
    if (this.currentFilter !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.room === this.currentFilter);
    }

    if (filteredAlerts.length === 0) {
      container.innerHTML = `
        <div class="no-alerts">
          <ha-icon icon="mdi:check-circle-outline"></ha-icon>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Alerts</div>
          <div>All systems are operating normally</div>
        </div>
      `;
      return;
    }

    // Sort by severity and time
    filteredAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.timestamp - a.timestamp;
    });

    container.innerHTML = filteredAlerts.map(alert => this.createAlertHTML(alert)).join('');

    // Add action button listeners
    container.querySelectorAll('.alert-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const alertId = e.target.dataset.alertId;
        const action = e.target.dataset.action;
        
        if (action === 'acknowledge') {
          this.acknowledgeAlert(alertId);
        } else if (action === 'snooze') {
          this.snoozeAlert(alertId);
        }
      });
    });
  }

  createAlertHTML(alert) {
    const isSnoozed = this.snoozedAlerts.has(alert.id);
    const timeAgo = this.getTimeAgo(alert.timestamp);

    const icons = {
      critical: 'mdi:alert-circle',
      warning: 'mdi:alert',
      info: 'mdi:information'
    };

    return `
      <div class="alert-item ${alert.severity} ${isSnoozed ? 'snoozed' : ''}">
        <div class="alert-header">
          <div class="alert-title">
            <ha-icon icon="${icons[alert.severity]}"></ha-icon>
            ${alert.title}
          </div>
          <span class="alert-room">${alert.room}</span>
        </div>
        <div class="alert-message">${alert.message}</div>
        <div class="alert-time">${timeAgo}</div>
        ${!isSnoozed ? `
          <div class="alert-actions">
            <button class="alert-action-btn acknowledge" data-alert-id="${alert.id}" data-action="acknowledge">
              Acknowledge
            </button>
            <button class="alert-action-btn snooze" data-alert-id="${alert.id}" data-action="snooze">
              Snooze 1h
            </button>
          </div>
        ` : '<div style="margin-top: 8px; font-size: 12px; color: var(--secondary-text-color);">Snoozed</div>'}
      </div>
    `;
  }

  acknowledgeAlert(alertId) {
    // Mark as acknowledged to prevent sound notifications
    this.acknowledgedAlerts.add(alertId);
    this.snoozedAlerts.add(alertId);
    this.updateCard();

    if (this.config.notification_service) {
      this._hass.callService('notify', this.config.notification_service.split('.')[1], {
        message: `Alert acknowledged: ${alertId}`,
        title: 'Grow Room Alert'
      });
    }
  }

  snoozeAlert(alertId) {
    this.snoozedAlerts.add(alertId);
    this.updateCard();

    // Auto-unsnooze after 1 hour
    setTimeout(() => {
      this.snoozedAlerts.delete(alertId);
      this.updateCard();
    }, 3600000);
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  getCardSize() {
    return 5;
  }

  static getStubConfig() {
    return {
      rooms: ['Flower Room 1', 'Flower Room 2', 'Veg Room'],
      alert_entities: [
        'binary_sensor.f1_high_temp',
        'binary_sensor.f1_low_humidity',
        'binary_sensor.f1_light_leak'
      ],
      show_history: true,
      notification_service: 'notify.mobile_app'
    };
  }
}

customElements.define('grow-alert-card', GrowAlertCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-alert-card',
  name: 'Grow Alert Card',
  description: 'Centralized alert management for all grow rooms'
});
