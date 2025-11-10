class GrowNutrientCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.dosingInProgress = false;
  }

  setConfig(config) {
    if (!config.reservoir_ec) {
      throw new Error('Please define reservoir_ec');
    }
    if (!config.reservoir_ph) {
      throw new Error('Please define reservoir_ph');
    }
    
    this.config = {
      ...config,
      title: config.title || 'Nutrient Dosing',
      target_ec: config.target_ec || 2.0,
      target_ph: config.target_ph || 5.8,
      reservoir_volume: config.reservoir_volume || 100,
      dosing_pumps: config.dosing_pumps || [],
      show_calculator: config.show_calculator !== false
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
        .reservoir-status {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px;
          background: var(--secondary-background-color);
        }
        .status-box {
          padding: 14px;
          border-radius: 10px;
          text-align: center;
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .status-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          pointer-events: none;
        }
        .status-box:hover {
          transform: translateY(-2px);
        }
        .status-box.ec {
          background: linear-gradient(135deg, #2196F3, #1976D2);
        }
        .status-box.ph {
          background: linear-gradient(135deg, #FF9800, #F57C00);
        }
        .status-box.level {
          background: linear-gradient(135deg, #4CAF50, #388E3C);
        }
        .status-box.temp {
          background: linear-gradient(135deg, #9C27B0, #7B1FA2);
        }
        .status-label {
          font-size: 11px;
          opacity: 0.9;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 600;
        }
        .status-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .status-unit {
          font-size: 14px;
          opacity: 0.85;
          margin-left: 2px;
        }
        .status-target {
          font-size: 10px;
          opacity: 0.8;
          margin-top: 4px;
        }
        .pumps-section {
          padding: 16px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pumps-grid {
          display: grid;
          gap: 12px;
        }
        .pump-card {
          background: var(--secondary-background-color);
          border-radius: 12px;
          padding: 14px;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .pump-card.active {
          border-color: var(--primary-color);
          background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.1), transparent);
        }
        .pump-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .pump-name {
          font-weight: 600;
          font-size: 15px;
          color: var(--primary-text-color);
        }
        .pump-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .pump-status.running {
          background: #4CAF50;
          color: white;
          animation: pulse 1s infinite;
        }
        .pump-status.idle {
          background: #757575;
          color: white;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pump-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .pump-button {
          flex: 1;
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
        }
        .pump-button:hover {
          opacity: 0.8;
        }
        .pump-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pump-button.stop {
          background: #F44336;
        }
        .dose-input {
          width: 60px;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
        .calculator-section {
          padding: 16px;
          background: var(--secondary-background-color);
          border-top: 1px solid var(--divider-color);
        }
        .calculator-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .calc-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .calc-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .calc-input {
          padding: 10px;
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
        .calc-result {
          padding: 12px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          border-radius: 8px;
          text-align: center;
          font-weight: 700;
          font-size: 16px;
        }
        .alert {
          padding: 12px;
          border-radius: 6px;
          margin: 12px 16px;
          font-size: 13px;
        }
        .alert-warning {
          background: rgba(255, 152, 0, 0.1);
          border-left: 4px solid #FF9800;
          color: #E65100;
        }
        .alert-success {
          background: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #4CAF50;
          color: #2E7D32;
        }
        .alert-info {
          background: rgba(33, 150, 243, 0.1);
          border-left: 4px solid #2196F3;
          color: #1565C0;
        }
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px;
        }
        .quick-action-btn {
          background: var(--secondary-background-color);
          border: 1px solid var(--divider-color);
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: var(--primary-text-color);
        }
        .quick-action-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      </style>
      <ha-card>
        <div class="card-header">${this.config.title}</div>
        
        <div class="reservoir-status" id="reservoir-status"></div>
        
        <div id="alerts-container"></div>
        
        <div class="pumps-section">
          <div class="section-title">
            <ha-icon icon="mdi:pump"></ha-icon>
            Dosing Pumps
          </div>
          <div class="pumps-grid" id="pumps-grid"></div>
        </div>

        ${this.config.show_calculator ? `
        <div class="calculator-section">
          <div class="section-title">
            <ha-icon icon="mdi:calculator"></ha-icon>
            Dosing Calculator
          </div>
          <div class="calculator-grid">
            <div class="calc-input-group">
              <label class="calc-label">Current EC</label>
              <input type="number" class="calc-input" id="calc-current-ec" step="0.1" value="0">
            </div>
            <div class="calc-input-group">
              <label class="calc-label">Target EC</label>
              <input type="number" class="calc-input" id="calc-target-ec" step="0.1" value="${this.config.target_ec}">
            </div>
            <div class="calc-input-group">
              <label class="calc-label">Volume (L)</label>
              <input type="number" class="calc-input" id="calc-volume" value="${this.config.reservoir_volume}">
            </div>
            <div class="calc-input-group">
              <label class="calc-label">Nutrient Strength</label>
              <input type="number" class="calc-input" id="calc-strength" step="0.1" value="1.0">
            </div>
          </div>
          <div class="calc-result" id="calc-result" style="margin-top: 12px;">
            Calculate dosing amount
          </div>
        </div>
        ` : ''}

        <div class="quick-actions">
          <button class="quick-action-btn" id="auto-dose-btn">
            <ha-icon icon="mdi:auto-fix"></ha-icon>
            Auto Dose
          </button>
          <button class="quick-action-btn" id="mix-btn">
            <ha-icon icon="mdi:sync"></ha-icon>
            Mix
          </button>
          <button class="quick-action-btn" id="drain-btn">
            <ha-icon icon="mdi:water-off"></ha-icon>
            Drain
          </button>
          <button class="quick-action-btn" id="fill-btn">
            <ha-icon icon="mdi:water-plus"></ha-icon>
            Fill
          </button>
        </div>
      </ha-card>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Calculator inputs
    if (this.config.show_calculator) {
      ['calc-current-ec', 'calc-target-ec', 'calc-volume', 'calc-strength'].forEach(id => {
        const input = this.shadowRoot.getElementById(id);
        if (input) {
          input.addEventListener('input', () => this.calculateDosing());
        }
      });
    }

    // Quick actions
    this.shadowRoot.getElementById('auto-dose-btn').addEventListener('click', () => {
      this.autoDose();
    });

    this.shadowRoot.getElementById('mix-btn').addEventListener('click', () => {
      this.mixReservoir();
    });
  }

  updateCard() {
    if (!this._hass) return;

    this.updateReservoirStatus();
    this.updatePumps();
    this.checkAlerts();
    
    if (this.config.show_calculator) {
      this.updateCalculator();
    }
  }

  updateReservoirStatus() {
    const container = this.shadowRoot.getElementById('reservoir-status');
    
    const ec = this.getEntityValue(this.config.reservoir_ec);
    const ph = this.getEntityValue(this.config.reservoir_ph);
    const level = this.config.reservoir_level ? this.getEntityValue(this.config.reservoir_level) : null;
    const temp = this.config.reservoir_temp ? this.getEntityValue(this.config.reservoir_temp) : null;

    let html = `
      <div class="status-box ec">
        <div class="status-label">EC</div>
        <div class="status-value">${ec.toFixed(2)}<span class="status-unit">mS/cm</span></div>
        <div class="status-target">Target: ${this.config.target_ec}</div>
      </div>
      <div class="status-box ph">
        <div class="status-label">pH</div>
        <div class="status-value">${ph.toFixed(1)}</div>
        <div class="status-target">Target: ${this.config.target_ph}</div>
      </div>
    `;

    if (level !== null) {
      html += `
        <div class="status-box level">
          <div class="status-label">Level</div>
          <div class="status-value">${level.toFixed(0)}<span class="status-unit">%</span></div>
          <div class="status-target">${(this.config.reservoir_volume * level / 100).toFixed(0)}L</div>
        </div>
      `;
    }

    if (temp !== null) {
      html += `
        <div class="status-box temp">
          <div class="status-label">Temp</div>
          <div class="status-value">${temp.toFixed(1)}<span class="status-unit">°C</span></div>
          <div class="status-target">Optimal: 18-22°C</div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  updatePumps() {
    const grid = this.shadowRoot.getElementById('pumps-grid');
    
    if (!this.config.dosing_pumps || this.config.dosing_pumps.length === 0) {
      grid.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--secondary-text-color);">No dosing pumps configured</div>';
      return;
    }

    grid.innerHTML = this.config.dosing_pumps.map(pump => {
      const entity = this._hass.states[pump.entity];
      const isRunning = entity && entity.state === 'on';

      return `
        <div class="pump-card ${isRunning ? 'active' : ''}">
          <div class="pump-header">
            <span class="pump-name">${pump.name}</span>
            <span class="pump-status ${isRunning ? 'running' : 'idle'}">
              ${isRunning ? 'Running' : 'Idle'}
            </span>
          </div>
          <div class="pump-controls">
            <input type="number" class="dose-input" value="10" min="1" max="100" step="1" id="dose-${pump.entity}">
            <button class="pump-button" onclick="this.getRootNode().host.dosePump('${pump.entity}', document.getElementById('dose-${pump.entity}').value)" ${isRunning ? 'disabled' : ''}>
              Dose (ml)
            </button>
            ${isRunning ? `
              <button class="pump-button stop" onclick="this.getRootNode().host.stopPump('${pump.entity}')">
                Stop
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  checkAlerts() {
    const container = this.shadowRoot.getElementById('alerts-container');
    const alerts = [];

    const ec = this.getEntityValue(this.config.reservoir_ec);
    const ph = this.getEntityValue(this.config.reservoir_ph);

    // EC alerts
    if (ec < this.config.target_ec - 0.5) {
      alerts.push({ type: 'warning', message: `EC is low (${ec.toFixed(2)}). Target: ${this.config.target_ec}` });
    } else if (ec > this.config.target_ec + 0.5) {
      alerts.push({ type: 'warning', message: `EC is high (${ec.toFixed(2)}). Target: ${this.config.target_ec}` });
    }

    // pH alerts
    if (ph < this.config.target_ph - 0.3) {
      alerts.push({ type: 'warning', message: `pH is low (${ph.toFixed(1)}). Target: ${this.config.target_ph}` });
    } else if (ph > this.config.target_ph + 0.3) {
      alerts.push({ type: 'warning', message: `pH is high (${ph.toFixed(1)}). Target: ${this.config.target_ph}` });
    }

    // Reservoir level alert
    if (this.config.reservoir_level) {
      const level = this.getEntityValue(this.config.reservoir_level);
      if (level < 20) {
        alerts.push({ type: 'warning', message: `Reservoir level low (${level.toFixed(0)}%)` });
      }
    }

    // Reservoir temp alert
    if (this.config.reservoir_temp) {
      const temp = this.getEntityValue(this.config.reservoir_temp);
      if (temp < 18 || temp > 22) {
        alerts.push({ type: 'info', message: `Reservoir temp ${temp.toFixed(1)}°C (Optimal: 18-22°C)` });
      }
    }

    if (alerts.length === 0) {
      container.innerHTML = '<div class="alert alert-success">✅ All parameters within target range</div>';
    } else {
      container.innerHTML = alerts.map(alert => 
        `<div class="alert alert-${alert.type}">⚠️ ${alert.message}</div>`
      ).join('');
    }
  }

  updateCalculator() {
    const currentEC = parseFloat(this.shadowRoot.getElementById('calc-current-ec').value) || 0;
    const targetEC = parseFloat(this.shadowRoot.getElementById('calc-target-ec').value) || this.config.target_ec;
    const volume = parseFloat(this.shadowRoot.getElementById('calc-volume').value) || this.config.reservoir_volume;
    const strength = parseFloat(this.shadowRoot.getElementById('calc-strength').value) || 1.0;

    // Update current EC from sensor
    this.shadowRoot.getElementById('calc-current-ec').value = this.getEntityValue(this.config.reservoir_ec).toFixed(2);
  }

  calculateDosing() {
    const currentEC = parseFloat(this.shadowRoot.getElementById('calc-current-ec').value) || 0;
    const targetEC = parseFloat(this.shadowRoot.getElementById('calc-target-ec').value) || this.config.target_ec;
    const volume = parseFloat(this.shadowRoot.getElementById('calc-volume').value) || this.config.reservoir_volume;
    const strength = parseFloat(this.shadowRoot.getElementById('calc-strength').value) || 1.0;

    const ecDiff = targetEC - currentEC;
    
    if (ecDiff <= 0) {
      this.shadowRoot.getElementById('calc-result').textContent = 'EC is already at or above target';
      return;
    }

    // Simplified calculation: ml = (EC difference * volume) / nutrient strength
    const mlNeeded = (ecDiff * volume * 10) / strength;

    this.shadowRoot.getElementById('calc-result').textContent = 
      `Add ${mlNeeded.toFixed(1)} ml of nutrients (${(mlNeeded / 2).toFixed(1)} ml Part A + ${(mlNeeded / 2).toFixed(1)} ml Part B)`;
  }

  dosePump(entityId, amount) {
    if (this.dosingInProgress) {
      alert('Dosing already in progress');
      return;
    }

    this.dosingInProgress = true;

    // Turn on pump
    this._hass.callService('switch', 'turn_on', {
      entity_id: entityId
    });

    // Calculate duration based on ml/second
    const pump = this.config.dosing_pumps.find(p => p.entity === entityId);
    const duration = (amount / (pump.ml_per_second || 10)) * 1000;

    // Turn off after duration
    setTimeout(() => {
      this._hass.callService('switch', 'turn_off', {
        entity_id: entityId
      });
      this.dosingInProgress = false;
    }, duration);
  }

  stopPump(entityId) {
    this._hass.callService('switch', 'turn_off', {
      entity_id: entityId
    });
    this.dosingInProgress = false;
  }

  autoDose() {
    const ec = this.getEntityValue(this.config.reservoir_ec);
    const targetEC = this.config.target_ec;

    if (ec >= targetEC) {
      alert('EC is already at target');
      return;
    }

    // Calculate and dose automatically
    const ecDiff = targetEC - ec;
    const volume = this.config.reservoir_volume;
    const mlNeeded = (ecDiff * volume * 10);

    // Dose Part A and Part B equally
    const partA = this.config.dosing_pumps.find(p => p.name.includes('Part A') || p.name.includes('A'));
    const partB = this.config.dosing_pumps.find(p => p.name.includes('Part B') || p.name.includes('B'));

    if (partA && partB) {
      this.dosePump(partA.entity, mlNeeded / 2);
      setTimeout(() => {
        this.dosePump(partB.entity, mlNeeded / 2);
      }, 2000);
    }
  }

  mixReservoir() {
    // Turn on circulation pump if configured
    if (this.config.circulation_pump) {
      this._hass.callService('switch', 'turn_on', {
        entity_id: this.config.circulation_pump
      });

      setTimeout(() => {
        this._hass.callService('switch', 'turn_off', {
          entity_id: this.config.circulation_pump
        });
      }, 60000); // Mix for 1 minute
    }
  }

  getEntityValue(entityId) {
    if (!entityId) return 0;
    const entity = this._hass.states[entityId];
    return entity ? parseFloat(entity.state) || 0 : 0;
  }

  getCardSize() {
    return 6;
  }

  static getStubConfig() {
    return {
      reservoir_ec: 'sensor.reservoir_ec',
      reservoir_ph: 'sensor.reservoir_ph',
      reservoir_level: 'sensor.reservoir_level',
      reservoir_temp: 'sensor.reservoir_temp',
      target_ec: 2.0,
      target_ph: 5.8,
      reservoir_volume: 100,
      dosing_pumps: [
        { entity: 'switch.pump_part_a', name: 'Part A', ml_per_second: 10 },
        { entity: 'switch.pump_part_b', name: 'Part B', ml_per_second: 10 }
      ]
    };
  }
}

customElements.define('grow-nutrient-card', GrowNutrientCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-nutrient-card',
  name: 'Grow Nutrient Card',
  description: 'Nutrient dosing control with EC/pH monitoring and calculator'
});
