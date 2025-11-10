class GrowSettingsCard extends HTMLElement {
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
      title: config.title || `${config.room_name} Settings`,
      start_date_entity: config.start_date_entity,
      light_schedule_on: config.light_schedule_on || 'input_datetime.light_on_time',
      light_schedule_off: config.light_schedule_off || 'input_datetime.light_off_time',
      growth_stage: config.growth_stage || 'input_select.growth_stage',
      calendar_entity: config.calendar_entity
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
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
        }
        .settings-container {
          padding: 16px;
        }
        .setting-group {
          background: var(--secondary-background-color);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .setting-group-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--divider-color);
        }
        .setting-item:last-child {
          border-bottom: none;
        }
        .setting-label {
          font-weight: 500;
          color: var(--primary-text-color);
        }
        .setting-value {
          font-weight: 600;
          color: var(--primary-color);
        }
        .setting-input {
          padding: 8px 12px;
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-weight: 600;
        }
        .action-button {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          margin-top: 8px;
        }
        .action-button:hover {
          opacity: 0.8;
        }
        .action-button.danger {
          background: #F44336;
        }
        .info-box {
          background: rgba(33, 150, 243, 0.1);
          border-left: 4px solid #2196F3;
          padding: 12px;
          border-radius: 6px;
          margin-top: 12px;
          font-size: 13px;
          color: var(--primary-text-color);
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-active {
          background: #4CAF50;
          color: white;
        }
        .status-inactive {
          background: #757575;
          color: white;
        }
      </style>
      <ha-card>
        <div class="card-header">${this.config.title}</div>
        
        <div class="settings-container">
          <div class="setting-group">
            <div class="setting-group-title">
              <ha-icon icon="mdi:calendar-start"></ha-icon>
              Grow Cycle
            </div>
            <div class="setting-item">
              <span class="setting-label">Start Date</span>
              <input type="date" class="setting-input" id="start-date-input">
            </div>
            <div class="setting-item">
              <span class="setting-label">Days in Flower</span>
              <span class="setting-value" id="days-in-flower">--</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Current Week</span>
              <span class="setting-value" id="current-week">--</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">Growth Stage</span>
              <select class="setting-input" id="growth-stage-select">
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
                <option value="late_flower">Late Flower</option>
              </select>
            </div>
            <button class="action-button" id="update-cycle-btn">Update Grow Cycle</button>
            <div class="info-box">
              💡 Changing the start date will automatically update the calendar with all scheduled events (deleaf, lollipop, harvest).
            </div>
          </div>

          <div class="setting-group">
            <div class="setting-group-title">
              <ha-icon icon="mdi:lightbulb-on"></ha-icon>
              Light Schedule
            </div>
            <div class="setting-item">
              <span class="setting-label">Lights On</span>
              <input type="time" class="setting-input" id="lights-on-input">
            </div>
            <div class="setting-item">
              <span class="setting-label">Lights Off</span>
              <input type="time" class="setting-input" id="lights-off-input">
            </div>
            <div class="setting-item">
              <span class="setting-label">Light Hours</span>
              <span class="setting-value" id="light-hours">12h</span>
            </div>
            <button class="action-button" id="update-lights-btn">Update Light Schedule</button>
          </div>

          <div class="setting-group">
            <div class="setting-group-title">
              <ha-icon icon="mdi:cog"></ha-icon>
              Quick Actions
            </div>
            <button class="action-button" id="start-new-grow-btn">
              <ha-icon icon="mdi:restart"></ha-icon>
              Start New Grow Cycle
            </button>
            <button class="action-button danger" id="reset-settings-btn">
              <ha-icon icon="mdi:refresh"></ha-icon>
              Reset All Settings
            </button>
          </div>
        </div>
      </ha-card>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Update cycle button
    this.shadowRoot.getElementById('update-cycle-btn').addEventListener('click', () => {
      this.updateGrowCycle();
    });

    // Update lights button
    this.shadowRoot.getElementById('update-lights-btn').addEventListener('click', () => {
      this.updateLightSchedule();
    });

    // Start new grow
    this.shadowRoot.getElementById('start-new-grow-btn').addEventListener('click', () => {
      this.startNewGrow();
    });

    // Reset settings
    this.shadowRoot.getElementById('reset-settings-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
        this.resetSettings();
      }
    });

    // Calculate light hours on time change
    ['lights-on-input', 'lights-off-input'].forEach(id => {
      this.shadowRoot.getElementById(id).addEventListener('change', () => {
        this.calculateLightHours();
      });
    });
  }

  updateCard() {
    if (!this._hass) return;

    // Load start date
    if (this.config.start_date_entity) {
      const startDateEntity = this._hass.states[this.config.start_date_entity];
      if (startDateEntity && startDateEntity.state !== 'unavailable') {
        this.shadowRoot.getElementById('start-date-input').value = startDateEntity.state;
        
        // Calculate days and week
        const startDate = new Date(startDateEntity.state);
        const now = new Date();
        const daysIn = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const week = Math.floor(daysIn / 7) + 1;
        
        this.shadowRoot.getElementById('days-in-flower').textContent = daysIn;
        this.shadowRoot.getElementById('current-week').textContent = `Week ${week}`;
      }
    }

    // Load light schedule
    const lightsOnEntity = this._hass.states[this.config.light_schedule_on];
    const lightsOffEntity = this._hass.states[this.config.light_schedule_off];
    
    if (lightsOnEntity) {
      this.shadowRoot.getElementById('lights-on-input').value = lightsOnEntity.state;
    }
    if (lightsOffEntity) {
      this.shadowRoot.getElementById('lights-off-input').value = lightsOffEntity.state;
    }
    
    this.calculateLightHours();

    // Load growth stage
    if (this.config.growth_stage) {
      const stageEntity = this._hass.states[this.config.growth_stage];
      if (stageEntity) {
        this.shadowRoot.getElementById('growth-stage-select').value = stageEntity.state;
      }
    }
  }

  calculateLightHours() {
    const onTime = this.shadowRoot.getElementById('lights-on-input').value;
    const offTime = this.shadowRoot.getElementById('lights-off-input').value;
    
    if (onTime && offTime) {
      const [onH, onM] = onTime.split(':').map(Number);
      const [offH, offM] = offTime.split(':').map(Number);
      
      let hours = offH - onH;
      if (hours < 0) hours += 24;
      
      this.shadowRoot.getElementById('light-hours').textContent = `${hours}h`;
    }
  }

  updateGrowCycle() {
    const startDate = this.shadowRoot.getElementById('start-date-input').value;
    const growthStage = this.shadowRoot.getElementById('growth-stage-select').value;
    
    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    // Update start date
    this._hass.callService('input_datetime', 'set_datetime', {
      entity_id: this.config.start_date_entity,
      date: startDate
    });

    // Update growth stage
    if (this.config.growth_stage) {
      this._hass.callService('input_select', 'select_option', {
        entity_id: this.config.growth_stage,
        option: growthStage
      });
    }

    // Trigger calendar update (calendar will auto-detect the change)
    this._hass.callService('persistent_notification', 'create', {
      message: `Grow cycle updated for ${this.config.room_name}. Calendar events have been automatically scheduled.`,
      title: 'Settings Updated'
    });
  }

  updateLightSchedule() {
    const onTime = this.shadowRoot.getElementById('lights-on-input').value;
    const offTime = this.shadowRoot.getElementById('lights-off-input').value;
    
    if (!onTime || !offTime) {
      alert('Please set both on and off times');
      return;
    }

    // Update light schedule
    this._hass.callService('input_datetime', 'set_datetime', {
      entity_id: this.config.light_schedule_on,
      time: onTime
    });

    this._hass.callService('input_datetime', 'set_datetime', {
      entity_id: this.config.light_schedule_off,
      time: offTime
    });

    this._hass.callService('persistent_notification', 'create', {
      message: 'Light schedule updated successfully',
      title: 'Settings Updated'
    });
  }

  startNewGrow() {
    if (!confirm('Start a new grow cycle? This will reset the start date to today and create new calendar events.')) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Set start date to today
    this._hass.callService('input_datetime', 'set_datetime', {
      entity_id: this.config.start_date_entity,
      date: today
    });

    // Reset to flowering stage
    if (this.config.growth_stage) {
      this._hass.callService('input_select', 'select_option', {
        entity_id: this.config.growth_stage,
        option: 'flowering'
      });
    }

    this._hass.callService('persistent_notification', 'create', {
      message: `New grow cycle started for ${this.config.room_name}! All calendar events have been scheduled based on Athena Pro Line handbook.`,
      title: 'New Grow Started'
    });
  }

  resetSettings() {
    // Reset to defaults
    this.shadowRoot.getElementById('start-date-input').value = '';
    this.shadowRoot.getElementById('lights-on-input').value = '06:00';
    this.shadowRoot.getElementById('lights-off-input').value = '18:00';
    this.shadowRoot.getElementById('growth-stage-select').value = 'flowering';
  }

  getCardSize() {
    return 5;
  }

  static getStubConfig() {
    return {
      room_name: 'Flower Room 1',
      start_date_entity: 'input_datetime.f1_start_date',
      light_schedule_on: 'input_datetime.f1_lights_on',
      light_schedule_off: 'input_datetime.f1_lights_off',
      growth_stage: 'input_select.f1_growth_stage'
    };
  }
}

customElements.define('grow-settings-card', GrowSettingsCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-settings-card',
  name: 'Grow Settings Card',
  description: 'Central configuration for grow room settings'
});
