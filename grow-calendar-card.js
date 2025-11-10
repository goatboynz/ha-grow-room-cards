class GrowCalendarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentDate = new Date();
    this.viewMode = 'month'; // month, week, timeline
  }

  setConfig(config) {
    if (!config.rooms || config.rooms.length === 0) {
      throw new Error('Please define at least one room');
    }
    
    this.config = {
      ...config,
      title: config.title || 'Grow Calendar',
      show_events: config.show_events !== false,
      show_tasks: config.show_tasks !== false,
      event_storage: config.event_storage || 'input_text.grow_calendar_events'
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
        .header-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .nav-button {
          background: var(--secondary-background-color);
          border: 1px solid var(--divider-color);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          color: var(--primary-text-color);
          transition: all 0.2s;
        }
        .nav-button:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .current-month {
          font-weight: 600;
          min-width: 120px;
          text-align: center;
        }
        .view-tabs {
          display: flex;
          border-bottom: 1px solid var(--divider-color);
          background: var(--secondary-background-color);
        }
        .view-tab {
          flex: 1;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          font-weight: 600;
          color: var(--secondary-text-color);
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
        }
        .view-tab:hover {
          background: var(--card-background-color);
        }
        .view-tab.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        .calendar-container {
          padding: 16px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .calendar-day-header {
          text-align: center;
          font-weight: 600;
          font-size: 12px;
          padding: 8px;
          color: var(--secondary-text-color);
          text-transform: uppercase;
        }
        .calendar-day {
          aspect-ratio: 1;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          padding: 4px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          background: var(--card-background-color);
        }
        .calendar-day:hover {
          background: var(--secondary-background-color);
          transform: scale(1.05);
          z-index: 1;
        }
        .calendar-day.other-month {
          opacity: 0.3;
        }
        .calendar-day.today {
          border-color: var(--primary-color);
          border-width: 2px;
          background: rgba(var(--rgb-primary-color), 0.1);
        }
        .day-number {
          font-weight: 600;
          font-size: 14px;
          color: var(--primary-text-color);
        }
        .day-events {
          margin-top: 4px;
          font-size: 10px;
        }
        .event-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          margin: 1px;
        }
        .timeline-container {
          padding: 16px;
        }
        .timeline {
          position: relative;
          padding-left: 40px;
        }
        .timeline-line {
          position: absolute;
          left: 20px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--divider-color);
        }
        .timeline-item {
          position: relative;
          margin-bottom: 24px;
          padding-left: 20px;
        }
        .timeline-dot {
          position: absolute;
          left: -28px;
          top: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid var(--card-background-color);
          z-index: 1;
        }
        .timeline-content {
          background: var(--secondary-background-color);
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid;
        }
        .timeline-date {
          font-size: 11px;
          font-weight: 600;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .timeline-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--primary-text-color);
          margin-bottom: 4px;
        }
        .timeline-room {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .room-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          margin-right: 4px;
        }
        .upcoming-tasks {
          padding: 16px;
          background: var(--secondary-background-color);
        }
        .task-item {
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          border-left: 3px solid var(--primary-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .task-info {
          flex: 1;
        }
        .task-title {
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 4px;
        }
        .task-date {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .task-days {
          font-weight: 700;
          font-size: 18px;
          color: var(--primary-color);
        }
        .legend {
          display: flex;
          gap: 16px;
          padding: 12px 16px;
          background: var(--secondary-background-color);
          flex-wrap: wrap;
          font-size: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
      </style>
      <ha-card>
        <div class="card-header">
          <span>${this.config.title}</span>
          <div class="header-controls">
            <button class="nav-button" id="prev-btn">◀</button>
            <span class="current-month" id="current-month"></span>
            <button class="nav-button" id="next-btn">▶</button>
            <button class="nav-button" id="today-btn">Today</button>
          </div>
        </div>

        <div class="view-tabs">
          <div class="view-tab active" data-view="month">Month</div>
          <div class="view-tab" data-view="timeline">Timeline</div>
          <div class="view-tab" data-view="tasks">Tasks</div>
        </div>

        <div id="month-view" class="calendar-container">
          <div class="calendar-grid" id="calendar-grid"></div>
        </div>

        <div id="timeline-view" class="timeline-container" style="display: none;">
          <div class="timeline" id="timeline"></div>
        </div>

        <div id="tasks-view" class="upcoming-tasks" style="display: none;">
          <h3 style="margin: 0 0 12px 0;">Upcoming Tasks</h3>
          <div id="tasks-list"></div>
        </div>

        <div class="legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #4CAF50;"></div>
            <span>Start Date</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #FF9800;"></div>
            <span>Deleaf</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #2196F3;"></div>
            <span>Lollipop</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #9C27B0;"></div>
            <span>Harvest</span>
          </div>
        </div>
      </ha-card>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Navigation buttons
    this.shadowRoot.getElementById('prev-btn').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.updateCard();
    });

    this.shadowRoot.getElementById('next-btn').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.updateCard();
    });

    this.shadowRoot.getElementById('today-btn').addEventListener('click', () => {
      this.currentDate = new Date();
      this.updateCard();
    });

    // View tabs
    this.shadowRoot.querySelectorAll('.view-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.shadowRoot.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.viewMode = e.target.dataset.view;
        this.updateView();
      });
    });
  }

  updateCard() {
    if (!this._hass) return;

    // Update month display
    const monthEl = this.shadowRoot.getElementById('current-month');
    monthEl.textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    this.updateView();
  }

  updateView() {
    // Hide all views
    this.shadowRoot.getElementById('month-view').style.display = 'none';
    this.shadowRoot.getElementById('timeline-view').style.display = 'none';
    this.shadowRoot.getElementById('tasks-view').style.display = 'none';

    // Show selected view
    if (this.viewMode === 'month') {
      this.shadowRoot.getElementById('month-view').style.display = 'block';
      this.renderCalendar();
    } else if (this.viewMode === 'timeline') {
      this.shadowRoot.getElementById('timeline-view').style.display = 'block';
      this.renderTimeline();
    } else if (this.viewMode === 'tasks') {
      this.shadowRoot.getElementById('tasks-view').style.display = 'block';
      this.renderTasks();
    }
  }

  renderCalendar() {
    const grid = this.shadowRoot.getElementById('calendar-grid');
    const events = this.getEvents();

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = dayHeaders.map(day => `<div class="calendar-day-header">${day}</div>`).join('');

    // Get first day of month
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Previous month days
    const prevMonthLastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      html += `<div class="calendar-day other-month"><div class="day-number">${prevMonthLastDay - i}</div></div>`;
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = events.filter(e => e.date.toDateString() === date.toDateString());

      html += `
        <div class="calendar-day ${isToday ? 'today' : ''}">
          <div class="day-number">${day}</div>
          <div class="day-events">
            ${dayEvents.map(e => `<span class="event-dot" style="background: ${e.color};"></span>`).join('')}
          </div>
        </div>
      `;
    }

    // Next month days
    const remainingDays = 42 - (startDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
      html += `<div class="calendar-day other-month"><div class="day-number">${day}</div></div>`;
    }

    grid.innerHTML = html;
  }

  renderTimeline() {
    const timeline = this.shadowRoot.getElementById('timeline');
    const events = this.getEvents().sort((a, b) => a.date - b.date);

    if (events.length === 0) {
      timeline.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--secondary-text-color);">No events scheduled</div>';
      return;
    }

    timeline.innerHTML = `
      <div class="timeline-line"></div>
      ${events.map(event => `
        <div class="timeline-item">
          <div class="timeline-dot" style="background: ${event.color};"></div>
          <div class="timeline-content" style="border-left-color: ${event.color};">
            <div class="timeline-date">${event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div class="timeline-title">${event.title}</div>
            <div class="timeline-room">
              <span class="room-badge" style="background: ${event.color}20; color: ${event.color};">${event.room}</span>
              ${event.description || ''}
            </div>
          </div>
        </div>
      `).join('')}
    `;
  }

  renderTasks() {
    const tasksList = this.shadowRoot.getElementById('tasks-list');
    const events = this.getEvents()
      .filter(e => e.date >= new Date())
      .sort((a, b) => a.date - b.date)
      .slice(0, 10);

    if (events.length === 0) {
      tasksList.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--secondary-text-color);">No upcoming tasks</div>';
      return;
    }

    const now = new Date();
    tasksList.innerHTML = events.map(event => {
      const daysUntil = Math.ceil((event.date - now) / (1000 * 60 * 60 * 24));
      const daysText = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`;

      return `
        <div class="task-item">
          <div class="task-info">
            <div class="task-title">${event.title}</div>
            <div class="task-date">
              <span class="room-badge" style="background: ${event.color}20; color: ${event.color};">${event.room}</span>
              ${event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div class="task-days">${daysText}</div>
        </div>
      `;
    }).join('');
  }

  getEvents() {
    const events = [];

    // Get events from each room
    this.config.rooms.forEach(room => {
      const startDateEntity = this._hass.states[room.start_date_entity];
      if (!startDateEntity || startDateEntity.state === 'unavailable') return;

      const startDate = new Date(startDateEntity.state);
      const roomColor = this.getRoomColor(room.name);

      // Start date
      events.push({
        date: startDate,
        title: `${room.name} - Start`,
        room: room.name,
        color: '#4CAF50',
        type: 'start'
      });

      // Deleaf 1 (Day 1)
      events.push({
        date: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        title: `${room.name} - Deleaf 1`,
        room: room.name,
        color: '#FF9800',
        type: 'deleaf'
      });

      // Lollipop (Day 21)
      events.push({
        date: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        title: `${room.name} - Lollipop`,
        room: room.name,
        color: '#2196F3',
        type: 'lollipop'
      });

      // Main Deleaf (Day 21)
      events.push({
        date: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        title: `${room.name} - Main Deleaf`,
        room: room.name,
        color: '#FF9800',
        type: 'deleaf'
      });

      // Mid Deleaf (Day 35)
      events.push({
        date: new Date(startDate.getTime() + 35 * 24 * 60 * 60 * 1000),
        title: `${room.name} - Mid Deleaf`,
        room: room.name,
        color: '#FF9800',
        type: 'deleaf'
      });

      // Final Deleaf (Day 49)
      events.push({
        date: new Date(startDate.getTime() + 49 * 24 * 60 * 60 * 1000),
        title: `${room.name} - Final Deleaf`,
        room: room.name,
        color: '#FF9800',
        type: 'deleaf'
      });

      // Harvest (Day 56-60)
      events.push({
        date: new Date(startDate.getTime() + 56 * 24 * 60 * 60 * 1000),
        title: `${room.name} - Harvest Window`,
        room: room.name,
        color: '#9C27B0',
        type: 'harvest',
        description: 'Day 56-60'
      });
    });

    return events;
  }

  getRoomColor(roomName) {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    const hash = roomName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getCardSize() {
    return 6;
  }

  static getStubConfig() {
    return {
      rooms: [
        { name: 'Flower Room 1', start_date_entity: 'input_datetime.f1_start_date' },
        { name: 'Flower Room 2', start_date_entity: 'input_datetime.f2_start_date' }
      ],
      show_events: true,
      show_tasks: true
    };
  }
}

customElements.define('grow-calendar-card', GrowCalendarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-calendar-card',
  name: 'Grow Calendar Card',
  description: 'Visual timeline and scheduling for multiple grow rooms'
});
