class GrowSwitchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.switches || config.switches.length === 0) {
      throw new Error('Please define at least one switch');
    }
    this.config = {
      ...config,
      title: config.title || 'Equipment Control'
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
        }
        .switches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px;
        }
        .switch-card {
          background: var(--secondary-background-color);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 2px solid transparent;
        }
        .switch-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .switch-card.on {
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          border-color: var(--primary-color);
        }
        .switch-card.on::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          pointer-events: none;
        }
        .switch-icon {
          font-size: 32px;
          margin-bottom: 8px;
          transition: transform 0.3s ease;
        }
        .switch-card.on .switch-icon {
          transform: scale(1.1);
        }
        .switch-card.off .switch-icon {
          opacity: 0.5;
        }
        .switch-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 4px;
        }
        .switch-card.on .switch-name {
          color: white;
        }
        .switch-state {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          color: var(--secondary-text-color);
        }
        .switch-card.on .switch-state {
          color: rgba(255,255,255,0.9);
        }
        .switch-card.unavailable {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .switch-card.unavailable:hover {
          transform: none;
        }
      </style>
      <ha-card>
        <div class="card-header">${this.config.title}</div>
        <div class="switches-grid" id="switches-grid"></div>
      </ha-card>
    `;
  }

  updateCard() {
    if (!this._hass) return;

    const grid = this.shadowRoot.getElementById('switches-grid');
    const switches = this.config.switches.map(sw => this.createSwitch(sw)).join('');
    grid.innerHTML = switches;

    // Add click handlers
    grid.querySelectorAll('.switch-card').forEach(card => {
      card.addEventListener('click', () => {
        const entityId = card.dataset.entity;
        const state = card.dataset.state;
        
        if (state === 'unavailable') return;
        
        this._hass.callService('homeassistant', 'toggle', {
          entity_id: entityId
        });
      });
    });
  }

  createSwitch(switchConfig) {
    const entity = this._hass.states[switchConfig.entity];
    if (!entity) return '';

    const state = entity.state;
    const isOn = state === 'on';
    const isUnavailable = state === 'unavailable';
    
    const icons = {
      light: '💡',
      fan: '🌀',
      humidifier: '💨',
      dehumidifier: '🌬️',
      heater: '🔥',
      cooler: '❄️',
      pump: '⚡',
      valve: '🚰',
      default: '🔌'
    };

    const icon = icons[switchConfig.type] || icons.default;
    const name = switchConfig.name || entity.attributes.friendly_name || switchConfig.entity;

    return `
      <div class="switch-card ${isOn ? 'on' : 'off'} ${isUnavailable ? 'unavailable' : ''}" 
           data-entity="${switchConfig.entity}" 
           data-state="${state}">
        <div class="switch-icon">${icon}</div>
        <div class="switch-name">${name}</div>
        <div class="switch-state">${isUnavailable ? 'Unavailable' : (isOn ? 'On' : 'Off')}</div>
      </div>
    `;
  }

  getCardSize() {
    return 2;
  }

  static getStubConfig() {
    return {
      switches: [
        { entity: 'switch.grow_light', name: 'Grow Light', type: 'light' },
        { entity: 'switch.exhaust_fan', name: 'Exhaust Fan', type: 'fan' },
        { entity: 'switch.humidifier', name: 'Humidifier', type: 'humidifier' }
      ],
      title: 'Equipment Control'
    };
  }
}

customElements.define('grow-switch-card', GrowSwitchCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-switch-card',
  name: 'Grow Switch Card',
  description: 'Control grow room equipment with stylish switches'
});
