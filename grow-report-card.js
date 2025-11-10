class GrowReportCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentTab = 'overview';
  }

  setConfig(config) {
    if (!config.room_name) {
      throw new Error('Please define room_name');
    }
    if (!config.start_date_entity) {
      throw new Error('Please define start_date_entity');
    }
    
    this.config = {
      ...config,
      title: config.title || `${config.room_name} Grow Report`,
      // Required entities
      start_date_entity: config.start_date_entity,
      temperature_entity: config.temperature_entity,
      humidity_entity: config.humidity_entity,
      vpd_entity: config.vpd_entity,
      co2_entity: config.co2_entity,
      lights_entity: config.lights_entity,
      // Optional entities
      co2_toggle_entity: config.co2_toggle_entity,
      watering_toggle_entity: config.watering_toggle_entity,
      light_leak_entity: config.light_leak_entity,
      zone_1_entity: config.zone_1_entity,
      zone_2_entity: config.zone_2_entity,
      // Settings
      light_hours: config.light_hours || 12,
      feed_system: config.feed_system || 'athena_pro',
      grow_medium: config.grow_medium || 'coco'
    };
    
    this.render();
    this.setupTabs();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  setupTabs() {
    this.shadowRoot.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Update tab active states
    this.shadowRoot.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update content active states
    this.shadowRoot.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    this.shadowRoot.getElementById(`${tabName}-content`).classList.add('active');
    
    // Update content
    this.updateTabContent();
  }

  // Athena Pro Line schedule data
  getScheduleData(week) {
    const schedules = {
      1: { phase: 'Flower (Wk 1-2)', steering: 'Generative', t_min: 24, t_max: 28, h_min: 60, h_max: 72, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 1000, feed_ec: 3.0, runoff_ec_min: 5.0, runoff_ec_max: 6.0, dryback_min: 50, dryback_max: 60, runoff: '1-7%' },
      2: { phase: 'Flower (Wk 1-2)', steering: 'Generative', t_min: 24, t_max: 28, h_min: 60, h_max: 72, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 1000, feed_ec: 3.0, runoff_ec_min: 5.0, runoff_ec_max: 6.0, dryback_min: 50, dryback_max: 60, runoff: '1-7%' },
      3: { phase: 'Flower (Wk 3)', steering: 'Generative', t_min: 24, t_max: 28, h_min: 60, h_max: 72, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 1000, feed_ec: 3.0, runoff_ec_min: 5.0, runoff_ec_max: 6.3, dryback_min: 50, dryback_max: 60, runoff: '1-7%' },
      4: { phase: 'Flower (Wk 4)', steering: 'Generative', t_min: 24, t_max: 28, h_min: 60, h_max: 72, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 1000, feed_ec: 3.0, runoff_ec_min: 4.0, runoff_ec_max: 5.0, dryback_min: 50, dryback_max: 60, runoff: '1-7%' },
      5: { phase: 'Flower (Wk 5)', steering: 'Vegetative', t_min: 24, t_max: 28, h_min: 60, h_max: 72, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 1000, feed_ec: 3.0, runoff_ec_min: 4.0, runoff_ec_max: 5.0, dryback_min: 30, dryback_max: 40, runoff: '8-16%' },
      6: { phase: 'Flower (Wk 6)', steering: 'Vegetative', t_min: 24, t_max: 28, h_min: 60, h_max: 72, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 1000, feed_ec: 3.0, runoff_ec_min: 4.0, runoff_ec_max: 5.0, dryback_min: 30, dryback_max: 40, runoff: '8-16%' },
      7: { phase: 'Flower (Wk 7)', steering: 'Vegetative', t_min: 24, t_max: 28, h_min: 60, h_max: 72, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 1000, feed_ec: 3.0, runoff_ec_min: 3.0, runoff_ec_max: 4.0, dryback_min: 30, dryback_max: 40, runoff: '8-16%' },
      8: { phase: 'Finish (Wk 8 | Fade)', steering: 'Finish (Fade)', t_min: 18, t_max: 22, h_min: 50, h_max: 60, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 800, feed_ec: 3.0, runoff_ec_min: 2.5, runoff_ec_max: 3.0, dryback_min: 30, dryback_max: 40, runoff: '8-16%' },
      9: { phase: 'Flush (Wk 9+)', steering: 'Flush', t_min: 18, t_max: 22, h_min: 50, h_max: 60, v_min: 1.0, v_max: 1.2, ppfd_min: 600, ppfd_max: 800, feed_ec: 0.0, runoff_ec_min: 0.0, runoff_ec_max: 1.5, dryback_min: 30, dryback_max: 40, runoff: 'N/A (Flush)' }
    };
    
    return schedules[Math.min(week, 9)] || schedules[9];
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
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
        }
        .report-content {
          padding: 16px;
          font-size: 14px;
          line-height: 1.6;
        }
        .section {
          margin-bottom: 20px;
          padding: 12px;
          background: var(--secondary-background-color);
          border-radius: 8px;
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
        .section-title ha-icon {
          color: var(--primary-color);
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid var(--divider-color);
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 500;
          color: var(--secondary-text-color);
        }
        .info-value {
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .alert {
          padding: 12px;
          border-radius: 6px;
          margin: 8px 0;
          font-size: 13px;
        }
        .alert-success {
          background: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #4CAF50;
          color: #2E7D32;
        }
        .alert-warning {
          background: rgba(255, 152, 0, 0.1);
          border-left: 4px solid #FF9800;
          color: #E65100;
        }
        .alert-info {
          background: rgba(33, 150, 243, 0.1);
          border-left: 4px solid #2196F3;
          color: #1565C0;
        }
        .alert-title {
          font-weight: 700;
          margin-bottom: 8px;
        }
        .checklist {
          list-style: none;
          padding: 0;
          margin: 8px 0;
        }
        .checklist li {
          padding: 4px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-on {
          background: #4CAF50;
          color: white;
        }
        .status-off {
          background: #757575;
          color: white;
        }
        .schedule-item {
          padding: 6px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .schedule-date {
          font-weight: 600;
          color: var(--primary-color);
        }
        .schedule-status {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .targets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .target-box {
          padding: 10px;
          background: var(--card-background-color);
          border-radius: 6px;
          border: 1px solid var(--divider-color);
        }
        .target-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
        }
        .target-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--primary-text-color);
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
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
      </style>
      <ha-card>
        <div class="card-header">${this.config.title}</div>
        
        <div class="tabs">
          <div class="tab active" data-tab="overview">Overview</div>
          <div class="tab" data-tab="targets">Targets</div>
          <div class="tab" data-tab="schedule">Schedule</div>
          <div class="tab" data-tab="irrigation">Irrigation</div>
          <div class="tab" data-tab="checklist">Checklist</div>
        </div>
        
        <div class="tab-content active" id="overview-content">Loading...</div>
        <div class="tab-content" id="targets-content"></div>
        <div class="tab-content" id="schedule-content"></div>
        <div class="tab-content" id="irrigation-content"></div>
        <div class="tab-content" id="checklist-content"></div>
      </ha-card>
    `;
  }

  updateCard() {
    if (!this._hass) return;

    const content = this.shadowRoot.getElementById('report-content');
    
    // Get start date and calculate week/day
    const startDateEntity = this._hass.states[this.config.start_date_entity];
    if (!startDateEntity || startDateEntity.state === 'unavailable') {
      content.innerHTML = '<div class="alert alert-warning">Start date not set. Please configure start_date_entity.</div>';
      return;
    }

    const startDate = new Date(startDateEntity.state);
    const now = new Date();
    const daysIn = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const week = Math.floor(daysIn / 7) + 1;

    // Get schedule data for current week
    const schedule = this.getScheduleData(week);

    // Get current sensor values
    const temp = this.getEntityValue(this.config.temperature_entity);
    const humidity = this.getEntityValue(this.config.humidity_entity);
    const vpd = this.getEntityValue(this.config.vpd_entity);
    const co2 = this.getEntityValue(this.config.co2_entity);
    const lightsOn = this.isEntityOn(this.config.lights_entity);

    // Calculate DLI
    const dli = ((schedule.ppfd_max * this.config.light_hours * 3600) / 1000000).toFixed(1);

    // Calculate event dates
    const events = this.calculateEvents(startDate, now);

    // Check for alerts
    const alerts = this.checkAlerts(temp, humidity, vpd, co2, schedule, lightsOn);

    // Store data for tabs
    this.reportData = { daysIn, week, schedule, temp, humidity, vpd, co2, lightsOn, dli, events, alerts };
    
    // Update current tab content
    this.updateTabContent();
  }

  updateTabContent() {
    if (!this.reportData) return;
    
    const { daysIn, week, schedule, temp, humidity, vpd, co2, lightsOn, dli, events, alerts } = this.reportData;
    
    switch (this.currentTab) {
      case 'overview':
        this.shadowRoot.getElementById('overview-content').innerHTML = this.buildOverviewHTML(daysIn, week, schedule, temp, humidity, vpd, co2, lightsOn, dli, alerts);
        break;
      case 'targets':
        this.shadowRoot.getElementById('targets-content').innerHTML = this.buildTargetsHTML(week, schedule);
        break;
      case 'schedule':
        this.shadowRoot.getElementById('schedule-content').innerHTML = this.buildScheduleHTML(events, week);
        break;
      case 'irrigation':
        this.shadowRoot.getElementById('irrigation-content').innerHTML = this.buildIrrigationHTML();
        break;
      case 'checklist':
        this.shadowRoot.getElementById('checklist-content').innerHTML = this.buildChecklistHTML();
        break;
    }
  }

  getEntityValue(entityId) {
    if (!entityId) return 0;
    const entity = this._hass.states[entityId];
    return entity ? parseFloat(entity.state) || 0 : 0;
  }

  isEntityOn(entityId) {
    if (!entityId) return false;
    const entity = this._hass.states[entityId];
    return entity ? entity.state === 'on' : false;
  }

  calculateEvents(startDate, now) {
    const events = {};
    
    // Deleaf 1 (Day 1)
    events.deleaf1 = this.calculateEventStatus(startDate, now, 1);
    
    // Lollipop & Main Deleaf (Day 21)
    events.lollipop = this.calculateEventStatus(startDate, now, 21);
    events.deleafMain = this.calculateEventStatus(startDate, now, 21);
    
    // Mid-Flower Deleaf (Day 35)
    events.deleafMid = this.calculateEventStatus(startDate, now, 35);
    
    // Final Deleaf (Day 49)
    events.deleafFinal = this.calculateEventStatus(startDate, now, 49);
    
    // Harvest Window (Day 56-60)
    events.harvestStart = this.calculateEventStatus(startDate, now, 56);
    events.harvestEnd = this.calculateEventStatus(startDate, now, 60);
    
    return events;
  }

  calculateEventStatus(startDate, now, dayOffset) {
    const eventDate = new Date(startDate);
    eventDate.setDate(eventDate.getDate() + dayOffset);
    
    const daysUntil = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
    
    return {
      date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      daysUntil: daysUntil,
      status: daysUntil < 0 ? 'done' : daysUntil === 0 ? 'today' : 'upcoming'
    };
  }

  checkAlerts(temp, humidity, vpd, co2, schedule, lightsOn) {
    const alerts = [];
    
    if (temp > schedule.t_max) {
      alerts.push(`HIGH TEMP: ${temp.toFixed(1)}°C (Max: ${schedule.t_max}°C)`);
    }
    if (temp < schedule.t_min) {
      alerts.push(`LOW TEMP: ${temp.toFixed(1)}°C (Min: ${schedule.t_min}°C)`);
    }
    if (humidity > schedule.h_max) {
      alerts.push(`HIGH HUMIDITY: ${humidity.toFixed(1)}% (Max: ${schedule.h_max}%)`);
    }
    if (humidity < schedule.h_min) {
      alerts.push(`LOW HUMIDITY: ${humidity.toFixed(1)}% (Min: ${schedule.h_min}%)`);
    }
    if (vpd > schedule.v_max) {
      alerts.push(`HIGH VPD: ${vpd.toFixed(2)} kPa (Max: ${schedule.v_max} kPa)`);
    }
    if (vpd < schedule.v_min) {
      alerts.push(`LOW VPD: ${vpd.toFixed(2)} kPa (Min: ${schedule.v_min} kPa)`);
    }
    
    if (this.config.co2_toggle_entity && this.isEntityOn(this.config.co2_toggle_entity) && lightsOn) {
      if (co2 < 800) {
        alerts.push(`LOW CO2: ${co2} ppm (Target: 1200+)`);
      }
    }
    
    if (this.config.watering_toggle_entity && !this.isEntityOn(this.config.watering_toggle_entity)) {
      alerts.push('Watering DISABLED');
    }
    
    if (this.config.light_leak_entity && this.isEntityOn(this.config.light_leak_entity)) {
      alerts.push('LIGHT LEAK DETECTED!');
    }
    
    return alerts;
  }

  buildOverviewHTML(daysIn, week, schedule, temp, humidity, vpd, co2, lightsOn, dli, alerts) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const co2Target = week <= 7 ? '1200-1500' : '500-800';
    
    return `
      <div style="padding: 16px;">
        <div class="section" style="background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.1), transparent); border-left: 4px solid var(--primary-color);">
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">
            Day ${daysIn} of Flower (Week ${week} | ${schedule.phase})
          </div>
          <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px;">
            <span><strong>Lights:</strong> ${lightsOn ? '💡 ON' : '🌑 OFF'}</span>
            <span><strong>DLI Target:</strong> ${dli} mol/m²/day</span>
            <span><strong>Time:</strong> ${timeStr}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:thermometer"></ha-icon>
            Environment
          </div>
          <div class="info-row">
            <span class="info-label">Temperature</span>
            <span class="info-value">${temp.toFixed(1)}°C <span style="color: var(--secondary-text-color); font-weight: normal;">(Target: ${schedule.t_min}-${schedule.t_max}°C)</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">Humidity</span>
            <span class="info-value">${humidity.toFixed(1)}% <span style="color: var(--secondary-text-color); font-weight: normal;">(Target: ${schedule.h_min}-${schedule.h_max}%)</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">VPD</span>
            <span class="info-value">${vpd.toFixed(2)} kPa <span style="color: var(--secondary-text-color); font-weight: normal;">(Target: ${schedule.v_min}-${schedule.v_max} kPa)</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">CO₂</span>
            <span class="info-value">${co2} ppm <span style="color: var(--secondary-text-color); font-weight: normal;">(Target: ${co2Target} ppm)</span></span>
          </div>
        </div>

        ${this.buildAlertsHTML(alerts)}
      </div>
    `;
  }

  buildTargetsHTML(week, schedule) {
    return `
      <div style="padding: 16px;">
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:target"></ha-icon>
            Athena Pro Targets (Week ${week})
          </div>
          
          <div style="font-weight: 600; margin: 12px 0 8px 0; color: var(--primary-text-color);">Input Targets (Feed Tank)</div>
          <div class="targets-grid">
            <div class="target-box">
              <div class="target-label">Feed EC</div>
              <div class="target-value">${schedule.feed_ec.toFixed(1)}</div>
            </div>
            <div class="target-box">
              <div class="target-label">Feed pH</div>
              <div class="target-value">5.8-6.2</div>
            </div>
          </div>

          <div style="font-weight: 600; margin: 12px 0 8px 0; color: var(--primary-text-color);">Steering Targets</div>
          <div class="info-row">
            <span class="info-label">Crop Steering</span>
            <span class="info-value">${schedule.steering}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Dryback</span>
            <span class="info-value">${schedule.dryback_min}-${schedule.dryback_max}% <span style="font-size: 11px;">(Dry to 2nd knuckle)</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">Runoff</span>
            <span class="info-value">${schedule.runoff}</span>
          </div>

          <div style="font-weight: 600; margin: 12px 0 8px 0; color: var(--primary-text-color);">Output Targets (Runoff)</div>
          <div class="targets-grid">
            <div class="target-box">
              <div class="target-label">Runoff EC</div>
              <div class="target-value">${schedule.runoff_ec_min}-${schedule.runoff_ec_max}</div>
            </div>
            <div class="target-box">
              <div class="target-label">Runoff pH</div>
              <div class="target-value">5.9-6.3</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  buildChecklistHTML() {
    return `
      <div style="padding: 16px;">
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:clipboard-check-outline"></ha-icon>
            Daily Grower Checklist
          </div>
          <div class="alert alert-info">
            <div class="alert-title">Daily Checks (from Handbook p. 31)</div>
            <ul class="checklist">
              <li><ha-icon icon="mdi:thermometer-lines"></ha-icon> Record Temp & Humidity</li>
              <li><ha-icon icon="mdi:water-opacity"></ha-icon> Check Runoff EC & pH</li>
              <li><ha-icon icon="mdi:ph"></ha-icon> Confirm Feed Tank pH & EC</li>
              <li><ha-icon icon="mdi:sprout"></ha-icon> Inspect for Pests or Mildew</li>
              <li><ha-icon icon="mdi:hand-back-right-outline"></ha-icon> Check Moisture for Dryback</li>
              <li><ha-icon icon="mdi:leak"></ha-icon> Inspect for Light Leaks</li>
            </ul>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:help-rhombus-outline"></ha-icon>
            Troubleshooting Tips
          </div>
          <div class="alert alert-info">
            <div class="alert-title">Runoff EC (Handbook p. 55)</div>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li><strong>If Runoff EC is HIGH:</strong> Water with additional nutrient solution at your target Feed EC until Runoff EC drops to target.</li>
              <li><strong>If Runoff EC is LOW:</strong> Increase your Feed EC by 0.5-1.0 on the next feeding. Push less runoff to allow EC to stack.</li>
            </ul>
            <div class="alert-title" style="margin-top: 12px;">Watering Technique (Handbook p. 54)</div>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li><strong>Dripper Placement:</strong> Water at the center for instant hydration, then along the edges to encourage root expansion.</li>
              <li><strong>Prevent Channeling:</strong> Water slowly to prevent channeling. This should take at least 60 seconds to complete.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  buildReportHTML(daysIn, week, schedule, temp, humidity, vpd, co2, lightsOn, dli, events, alerts) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const co2Target = week <= 7 ? '1200-1500' : '500-800';
    
    return `
      <div class="section" style="background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.1), transparent); border-left: 4px solid var(--primary-color);">
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">
          Day ${daysIn} of Flower (Week ${week} | ${schedule.phase})
        </div>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px;">
          <span><strong>Lights:</strong> ${lightsOn ? '💡 ON' : '🌑 OFF'}</span>
          <span><strong>DLI Target:</strong> ${dli} mol/m²/day</span>
          <span><strong>Time:</strong> ${timeStr}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:thermometer"></ha-icon>
          Environment
        </div>
        <div class="info-row">
          <span class="info-label">Temperature</span>
          <span class="info-value">${temp.toFixed(1)}°C <span style="color: var(--secondary-text-color); font-weight: normal;">(Target: ${schedule.t_min}-${schedule.t_max}°C)</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Humidity</span>
          <span class="info-value">${humidity.toFixed(1)}% <span style="color: var(--secondary-text-color); font-weight: normal;">(Target: ${schedule.h_min}-${schedule.h_max}%)</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">VPD</span>
          <span class="info-value">${vpd.toFixed(2)} kPa <span style="color: var(--secondary-text-color); font-weight: normal;">(Target: ${schedule.v_min}-${schedule.v_max} kPa)</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">CO₂</span>
          <span class="info-value">${co2} ppm <span style="color: var(--secondary-text-color); font-weight: normal;">(Target: ${co2Target} ppm)</span></span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:target"></ha-icon>
          Athena Pro Targets (Week ${week})
        </div>
        
        <div style="font-weight: 600; margin: 12px 0 8px 0; color: var(--primary-text-color);">Input Targets (Feed Tank)</div>
        <div class="targets-grid">
          <div class="target-box">
            <div class="target-label">Feed EC</div>
            <div class="target-value">${schedule.feed_ec.toFixed(1)}</div>
          </div>
          <div class="target-box">
            <div class="target-label">Feed pH</div>
            <div class="target-value">5.8-6.2</div>
          </div>
        </div>

        <div style="font-weight: 600; margin: 12px 0 8px 0; color: var(--primary-text-color);">Steering Targets</div>
        <div class="info-row">
          <span class="info-label">Crop Steering</span>
          <span class="info-value">${schedule.steering}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dryback</span>
          <span class="info-value">${schedule.dryback_min}-${schedule.dryback_max}% <span style="font-size: 11px;">(Dry to 2nd knuckle)</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Runoff</span>
          <span class="info-value">${schedule.runoff}</span>
        </div>

        <div style="font-weight: 600; margin: 12px 0 8px 0; color: var(--primary-text-color);">Output Targets (Runoff)</div>
        <div class="targets-grid">
          <div class="target-box">
            <div class="target-label">Runoff EC</div>
            <div class="target-value">${schedule.runoff_ec_min}-${schedule.runoff_ec_max}</div>
          </div>
          <div class="target-box">
            <div class="target-label">Runoff pH</div>
            <div class="target-value">5.9-6.3</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:calendar-check"></ha-icon>
          Grow Schedule
        </div>
        ${this.buildScheduleHTML(events, week)}
      </div>

      ${this.config.zone_1_entity || this.config.zone_2_entity ? `
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:water-pump"></ha-icon>
          Irrigation Status
        </div>
        ${this.buildIrrigationHTML()}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:clipboard-check-outline"></ha-icon>
          Daily Grower Checklist
        </div>
        <div class="alert alert-info">
          <div class="alert-title">Daily Checks (from Handbook p. 31)</div>
          <ul class="checklist">
            <li><ha-icon icon="mdi:thermometer-lines"></ha-icon> Record Temp & Humidity</li>
            <li><ha-icon icon="mdi:water-opacity"></ha-icon> Check Runoff EC & pH</li>
            <li><ha-icon icon="mdi:ph"></ha-icon> Confirm Feed Tank pH & EC</li>
            <li><ha-icon icon="mdi:sprout"></ha-icon> Inspect for Pests or Mildew</li>
            <li><ha-icon icon="mdi:hand-back-right-outline"></ha-icon> Check Moisture for Dryback</li>
            <li><ha-icon icon="mdi:leak"></ha-icon> Inspect for Light Leaks</li>
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:help-rhombus-outline"></ha-icon>
          Troubleshooting Tips
        </div>
        <div class="alert alert-info">
          <div class="alert-title">Runoff EC (Handbook p. 55)</div>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li><strong>If Runoff EC is HIGH:</strong> Water with additional nutrient solution at your target Feed EC until Runoff EC drops to target.</li>
            <li><strong>If Runoff EC is LOW:</strong> Increase your Feed EC by 0.5-1.0 on the next feeding. Push less runoff to allow EC to stack.</li>
          </ul>
          <div class="alert-title" style="margin-top: 12px;">Watering Technique (Handbook p. 54)</div>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li><strong>Dripper Placement:</strong> Water at the center for instant hydration, then along the edges to encourage root expansion.</li>
            <li><strong>Prevent Channeling:</strong> Water slowly to prevent channeling. This should take at least 60 seconds to complete.</li>
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:alert-outline"></ha-icon>
          System Status
        </div>
        ${this.buildAlertsHTML(alerts)}
      </div>
    `;
  }

  buildScheduleHTML(events, week) {
    return `
      <div style="padding: 16px;">
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:calendar-check"></ha-icon>
            Grow Schedule
          </div>
          <div class="schedule-item">
            <span><strong>IPW Spray:</strong> ${week <= 3 ? '<span style="color: #FF9800;">Active</span> (2x/week, ends Wk 3)' : '✅ Done'}</span>
            <span class="schedule-status" style="color: #FF9800;">${week <= 3 ? 'WARN: Lights OFF, Media WET only!' : ''}</span>
          </div>
          <div class="schedule-item">
            <span><strong>Deleaf 1:</strong> <span class="schedule-date">${events.deleaf1.date}</span></span>
            <span class="schedule-status">${this.getEventStatusText(events.deleaf1)}</span>
          </div>
          <div class="schedule-item">
            <span><strong>Lollipop:</strong> <span class="schedule-date">${events.lollipop.date}</span></span>
            <span class="schedule-status">${this.getEventStatusText(events.lollipop)}</span>
          </div>
          <div class="schedule-item">
            <span><strong>Deleaf (Main):</strong> <span class="schedule-date">${events.deleafMain.date}</span></span>
            <span class="schedule-status">${this.getEventStatusText(events.deleafMain)} (Same day as Lollipop)</span>
          </div>
          <div class="schedule-item">
            <span><strong>Deleaf (Mid):</strong> <span class="schedule-date">${events.deleafMid.date}</span></span>
            <span class="schedule-status">${this.getEventStatusText(events.deleafMid)}</span>
          </div>
          <div class="schedule-item">
            <span><strong>Deleaf (Final):</strong> <span class="schedule-date">${events.deleafFinal.date}</span></span>
            <span class="schedule-status">${this.getEventStatusText(events.deleafFinal)}</span>
          </div>
          <div class="schedule-item">
            <span><strong>Harvest:</strong> <span class="schedule-date">${events.harvestStart.date} - ${events.harvestEnd.date}</span></span>
            <span class="schedule-status">${this.getEventStatusText(events.harvestStart)} (Flush last 3 days)</span>
          </div>
        </div>
      </div>
    `;
  }

  getEventStatusText(event) {
    if (event.status === 'done') {
      return '✅ Done';
    } else if (event.status === 'today') {
      return '🔔 TODAY!';
    } else {
      return `(${event.daysUntil}d)`;
    }
  }

  buildIrrigationHTML() {
    let zoneInfo = '';
    
    if (this.config.zone_1_entity) {
      const zone1 = this._hass.states[this.config.zone_1_entity];
      if (zone1) {
        const lastChanged = new Date(zone1.last_changed);
        const now = new Date();
        const minutesAgo = Math.floor((now - lastChanged) / (1000 * 60));
        const hoursAgo = Math.floor(minutesAgo / 60);
        const timeAgo = hoursAgo > 0 ? `${hoursAgo}h ago` : `${minutesAgo}m ago`;
        
        zoneInfo += `
          <div class="info-row">
            <span class="info-label">Zone 1 Last Fed</span>
            <span class="info-value">${timeAgo}</span>
          </div>
        `;
      }
    }
    
    if (this.config.zone_2_entity) {
      const zone2 = this._hass.states[this.config.zone_2_entity];
      if (zone2) {
        const lastChanged = new Date(zone2.last_changed);
        const now = new Date();
        const minutesAgo = Math.floor((now - lastChanged) / (1000 * 60));
        const hoursAgo = Math.floor(minutesAgo / 60);
        const timeAgo = hoursAgo > 0 ? `${hoursAgo}h ago` : `${minutesAgo}m ago`;
        
        zoneInfo += `
          <div class="info-row">
            <span class="info-label">Zone 2 Last Fed</span>
            <span class="info-value">${timeAgo}</span>
          </div>
        `;
      }
    }
    
    if (!zoneInfo) {
      zoneInfo = '<div class="info-row"><span class="info-label">No irrigation zones configured</span></div>';
    }
    
    return `
      <div style="padding: 16px;">
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:water-pump"></ha-icon>
            Irrigation Status
          </div>
          ${zoneInfo}
        </div>
      </div>
    `;
  }

  buildAlertsHTML(alerts) {
    if (alerts.length === 0) {
      return '<div class="alert alert-success"><div class="alert-title">✅ All Systems Optimal</div></div>';
    }
    
    return `
      <div class="alert alert-warning">
        <div class="alert-title">⚠️ ACTIVE ALERTS</div>
        <ul style="margin: 8px 0; padding-left: 20px;">
          ${alerts.map(alert => `<li>${alert}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  getCardSize() {
    return 8;
  }

  static getStubConfig() {
    return {
      room_name: 'Flower Room 1',
      start_date_entity: 'input_datetime.flower_room_1_start_date',
      temperature_entity: 'sensor.flower_room_1_temperature',
      humidity_entity: 'sensor.flower_room_1_humidity',
      vpd_entity: 'sensor.flower_room_1_vpd',
      co2_entity: 'sensor.flower_room_1_co2',
      lights_entity: 'switch.flower_room_1_lights',
      light_hours: 12,
      feed_system: 'athena_pro',
      grow_medium: 'coco'
    };
  }
}

customElements.define('grow-report-card', GrowReportCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-report-card',
  name: 'Grow Report Card',
  description: 'Comprehensive daily/weekly grow report with Athena Pro Line schedule'
});
