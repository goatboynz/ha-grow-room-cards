/**
 * Grow Sensor Monitor Card v1.0
 * Displays multiple sensors organized in tabs
 */
class GrowSensorMonitorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentTab = null;
  }

  setConfig(config) {
    if (!config.tabs || config.tabs.length === 0) {
      throw new Error('Please define at least one tab with sensors');
    }
    
    this.config = {
      ...config,
      title: config.title || 'Sensor Monitor'
    };
    
    this.currentTab = config.tabs[0].name;
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
          font-weight: 600;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--divider-color);
          background: var(--secondary-background-color);
          overflow-x: auto;
        }
        .tab {
          flex: 1;
          min-width: 100px;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          font-weight: 600;
          color: var(--secondary-text-color);
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
        }
        .tab:hover {
          background: var(--card-background-color);
        }
        .tab.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        .sensors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          padding: 16px;
        }
        .sensor-card {
          background: var(--secondary-background-color);
          border-radius: 12px;
          padding: 16px;
          border-left: 4px solid var(--primary-color);
          transition: all 0.2s;
        }
        .sensor-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sensor-icon {
          font-size: 32px;
          margin-bottom: 8px;
          color: var(--primary-color);
        }
        .sensor-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--secondary-text-color);
          margin-bottom: 8px;
        }
        .sensor-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary-text-color);
        }
        .sensor-unit {
          font-size: 14px;
          color: var(--secondary-text-color);
          margin-left: 4px;
        }
        .sensor-state {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
        .unavailable {
          opacity: 0.5;
        }
      </style>
      <ha-card>
        <div class="card-header">${this.config.title}</div>
        <div class="tabs" id="tabs"></div>
        <div class="sensors-grid" id="sensors-grid"></div>
      </ha-card>
    `;
    
    this.setupTabs();
  }

  setupTabs() {
    const tabsContainer = this.shadowRoot.getElementById('tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = this.config.tabs.map(tab => 
      `<div class="tab ${tab.name === this.currentTab ? 'active' : ''}" data-tab="${tab.name}">${tab.name}</div>`
    ).join('');

    tabsContainer.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.currentTab = e.target.dataset.tab;
        this.setupTabs();
        this.updateCard();
      });
    });
  }

  updateCard() {
    if (!this._hass) return;

    const grid = this.shadowRoot.getElementById('sensors-grid');
    const currentTabConfig = this.config.tabs.find(t => t.name === this.currentTab);
    
    if (!currentTabConfig || !currentTabConfig.sensors) {
      grid.innerHTML = '<div style="padding: 20px; text-align: center;">No sensors configured</div>';
      return;
    }

    const sensors = currentTabConfig.sensors.map(sensor => this.createSensor(sensor)).join('');
    grid.innerHTML = sensors;
    
    // Add click handlers to show history
    grid.querySelectorAll('.sensor-card').forEach(card => {
      const entityId = card.dataset.entity;
      if (entityId && !card.classList.contains('unavailable')) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          this.showEntityHistory(entityId);
        });
      }
    });
  }

  showEntityHistory(entityId) {
    const event = new Event('hass-more-info', {
      bubbles: true,
      composed: true
    });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  createSensor(sensor) {
    const entity = this._hass.states[sensor.entity];
    
    if (!entity) {
      return `
        <div class="sensor-card unavailable">
          <div class="sensor-icon">${sensor.icon || '❓'}</div>
          <div class="sensor-name">${sensor.name}</div>
          <div class="sensor-value">N/A</div>
        </div>
      `;
    }

    const state = entity.state;
    const unit = entity.attributes.unit_of_measurement || '';
    const isUnavailable = state === 'unavailable' || state === 'unknown';
    
    // Format number to 1 decimal place
    let displayValue = state;
    if (!isUnavailable && !isNaN(parseFloat(state))) {
      displayValue = parseFloat(state).toFixed(1);
    }
    
    return `
      <div class="sensor-card ${isUnavailable ? 'unavailable' : ''}" data-entity="${sensor.entity}">
        <div class="sensor-icon">${sensor.icon || '📊'}</div>
        <div class="sensor-name">${sensor.name}</div>
        <div class="sensor-value">
          ${isUnavailable ? 'N/A' : displayValue}
          ${!isUnavailable && unit ? `<span class="sensor-unit">${unit}</span>` : ''}
        </div>
        <div class="sensor-state">${entity.attributes.friendly_name || ''}</div>
      </div>
    `;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define('grow-sensor-monitor-card', GrowSensorMonitorCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-sensor-monitor-card',
  name: 'Grow Sensor Monitor Card',
  description: 'Display multiple sensors organized in tabs',
  preview: true
});
