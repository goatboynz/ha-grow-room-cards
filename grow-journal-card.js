class GrowJournalCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.entries = [];
    this.currentFilter = 'all';
  }

  setConfig(config) {
    if (!config.room_name) {
      throw new Error('Please define room_name');
    }
    
    this.config = {
      ...config,
      title: config.title || `${config.room_name} Journal`,
      storage_entity: config.storage_entity || `input_text.${config.room_name.toLowerCase().replace(/\s+/g, '_')}_journal`,
      max_entries: config.max_entries || 100,
      tags: config.tags || ['General', 'Watering', 'Feeding', 'Training', 'Deficiency', 'Pest', 'Observation']
    };
    
    this.render();
    this.loadEntries();
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
        .entry-form {
          padding: 16px;
          background: var(--secondary-background-color);
          border-bottom: 1px solid var(--divider-color);
        }
        .form-group {
          margin-bottom: 12px;
        }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: block;
        }
        .form-input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          font-size: 14px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-family: inherit;
          box-sizing: border-box;
        }
        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }
        .tags-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag-button {
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
        .tag-button:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .tag-button.selected {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .submit-button {
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
        }
        .submit-button:hover {
          opacity: 0.8;
        }
        .filter-bar {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: var(--secondary-background-color);
          overflow-x: auto;
        }
        .filter-chip {
          padding: 6px 12px;
          border-radius: 16px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .filter-chip:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .filter-chip.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .entries-container {
          padding: 16px;
          max-height: 500px;
          overflow-y: auto;
        }
        .entry-item {
          background: var(--secondary-background-color);
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 12px;
          border-left: 4px solid var(--primary-color);
          transition: all 0.2s;
        }
        .entry-item:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .entry-date {
          font-size: 12px;
          font-weight: 600;
          color: var(--secondary-text-color);
        }
        .entry-tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          background: var(--primary-color);
          color: white;
        }
        .entry-content {
          color: var(--primary-text-color);
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .entry-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .entry-action-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--secondary-text-color);
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .entry-action-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .entry-action-btn.delete {
          color: #F44336;
        }
        .entry-action-btn.delete:hover {
          background: #F44336;
          color: white;
          border-color: #F44336;
        }
        .no-entries {
          text-align: center;
          padding: 60px 20px;
          color: var(--secondary-text-color);
        }
        .no-entries ha-icon {
          font-size: 64px;
          color: var(--secondary-text-color);
          margin-bottom: 16px;
        }
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
          padding: 12px 16px;
          background: var(--secondary-background-color);
          border-bottom: 1px solid var(--divider-color);
        }
        .stat-box {
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary-color);
        }
        .stat-label {
          font-size: 10px;
          text-transform: uppercase;
          color: var(--secondary-text-color);
          font-weight: 600;
        }
        .toggle-form-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 0;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .toggle-form-btn:hover {
          opacity: 0.8;
        }
      </style>
      <ha-card>
        <div class="card-header">${this.config.title}</div>

        <div class="stats-bar" id="stats-bar"></div>

        <button class="toggle-form-btn" id="toggle-form-btn">
          <ha-icon icon="mdi:plus-circle"></ha-icon>
          New Entry
        </button>

        <div class="entry-form" id="entry-form" style="display: none;">
          <div class="form-group">
            <label class="form-label">Note</label>
            <textarea class="form-input form-textarea" id="entry-note" placeholder="What happened today?"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Tag</label>
            <div class="tags-container" id="tags-container"></div>
          </div>
          <button class="submit-button" id="submit-btn">Save Entry</button>
        </div>

        <div class="filter-bar" id="filter-bar"></div>

        <div class="entries-container" id="entries-container"></div>
      </ha-card>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Toggle form
    this.shadowRoot.getElementById('toggle-form-btn').addEventListener('click', () => {
      const form = this.shadowRoot.getElementById('entry-form');
      const btn = this.shadowRoot.getElementById('toggle-form-btn');
      
      if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.innerHTML = '<ha-icon icon="mdi:close-circle"></ha-icon> Cancel';
      } else {
        form.style.display = 'none';
        btn.innerHTML = '<ha-icon icon="mdi:plus-circle"></ha-icon> New Entry';
        this.clearForm();
      }
    });

    // Submit entry
    this.shadowRoot.getElementById('submit-btn').addEventListener('click', () => {
      this.saveEntry();
    });

    // Render tags
    this.renderTags();
  }

  renderTags() {
    const container = this.shadowRoot.getElementById('tags-container');
    container.innerHTML = this.config.tags.map(tag => 
      `<button class="tag-button" data-tag="${tag}">${tag}</button>`
    ).join('');

    // Add tag selection
    container.querySelectorAll('.tag-button').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tag-button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }

  updateCard() {
    if (!this._hass) return;

    this.loadEntries();
    this.renderStats();
    this.renderFilters();
    this.renderEntries();
  }

  loadEntries() {
    const storageEntity = this._hass.states[this.config.storage_entity];
    
    if (storageEntity && storageEntity.state && storageEntity.state !== 'unknown') {
      try {
        this.entries = JSON.parse(storageEntity.state);
      } catch (e) {
        this.entries = [];
      }
    } else {
      this.entries = [];
    }
  }

  saveEntry() {
    const note = this.shadowRoot.getElementById('entry-note').value.trim();
    const selectedTag = this.shadowRoot.querySelector('.tag-button.selected');

    if (!note) {
      alert('Please enter a note');
      return;
    }

    if (!selectedTag) {
      alert('Please select a tag');
      return;
    }

    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      note: note,
      tag: selectedTag.dataset.tag,
      room: this.config.room_name
    };

    this.entries.unshift(entry);

    // Keep only max entries
    if (this.entries.length > this.config.max_entries) {
      this.entries = this.entries.slice(0, this.config.max_entries);
    }

    // Save to Home Assistant
    this._hass.callService('input_text', 'set_value', {
      entity_id: this.config.storage_entity,
      value: JSON.stringify(this.entries)
    });

    // Clear form and hide
    this.clearForm();
    this.shadowRoot.getElementById('entry-form').style.display = 'none';
    this.shadowRoot.getElementById('toggle-form-btn').innerHTML = '<ha-icon icon="mdi:plus-circle"></ha-icon> New Entry';

    // Refresh display
    this.updateCard();
  }

  clearForm() {
    this.shadowRoot.getElementById('entry-note').value = '';
    this.shadowRoot.querySelectorAll('.tag-button').forEach(b => b.classList.remove('selected'));
  }

  deleteEntry(entryId) {
    if (!confirm('Delete this entry?')) return;

    this.entries = this.entries.filter(e => e.id !== entryId);

    // Save to Home Assistant
    this._hass.callService('input_text', 'set_value', {
      entity_id: this.config.storage_entity,
      value: JSON.stringify(this.entries)
    });

    this.updateCard();
  }

  renderStats() {
    const statsBar = this.shadowRoot.getElementById('stats-bar');
    
    const totalEntries = this.entries.length;
    const thisWeek = this.entries.filter(e => {
      const entryDate = new Date(e.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length;

    const tagCounts = {};
    this.entries.forEach(e => {
      tagCounts[e.tag] = (tagCounts[e.tag] || 0) + 1;
    });
    const mostUsedTag = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])[0] || 'None';

    statsBar.innerHTML = `
      <div class="stat-box">
        <div class="stat-value">${totalEntries}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${thisWeek}</div>
        <div class="stat-label">This Week</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${mostUsedTag}</div>
        <div class="stat-label">Top Tag</div>
      </div>
    `;
  }

  renderFilters() {
    const filterBar = this.shadowRoot.getElementById('filter-bar');
    
    const tags = ['all', ...new Set(this.entries.map(e => e.tag))];
    
    filterBar.innerHTML = tags.map(tag => 
      `<button class="filter-chip ${tag === this.currentFilter ? 'active' : ''}" data-filter="${tag}">
        ${tag === 'all' ? 'All' : tag}
      </button>`
    ).join('');

    // Add filter listeners
    filterBar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.currentFilter = chip.dataset.filter;
        this.renderFilters();
        this.renderEntries();
      });
    });
  }

  renderEntries() {
    const container = this.shadowRoot.getElementById('entries-container');
    
    let filteredEntries = this.entries;
    if (this.currentFilter !== 'all') {
      filteredEntries = this.entries.filter(e => e.tag === this.currentFilter);
    }

    if (filteredEntries.length === 0) {
      container.innerHTML = `
        <div class="no-entries">
          <ha-icon icon="mdi:notebook-outline"></ha-icon>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Entries</div>
          <div>Start documenting your grow journey</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredEntries.map(entry => {
      const date = new Date(entry.date);
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const tagColors = {
        'General': '#757575',
        'Watering': '#2196F3',
        'Feeding': '#4CAF50',
        'Training': '#FF9800',
        'Deficiency': '#F44336',
        'Pest': '#E91E63',
        'Observation': '#9C27B0'
      };

      return `
        <div class="entry-item" style="border-left-color: ${tagColors[entry.tag] || '#757575'};">
          <div class="entry-header">
            <div class="entry-date">${dateStr}</div>
            <div class="entry-tag" style="background: ${tagColors[entry.tag] || '#757575'};">${entry.tag}</div>
          </div>
          <div class="entry-content">${entry.note}</div>
          <div class="entry-actions">
            <button class="entry-action-btn delete" onclick="this.getRootNode().host.deleteEntry(${entry.id})">
              <ha-icon icon="mdi:delete"></ha-icon> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  getCardSize() {
    return 6;
  }

  static getStubConfig() {
    return {
      room_name: 'Flower Room 1',
      storage_entity: 'input_text.f1_journal',
      max_entries: 100,
      tags: ['General', 'Watering', 'Feeding', 'Training', 'Deficiency', 'Pest', 'Observation']
    };
  }
}

customElements.define('grow-journal-card', GrowJournalCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-journal-card',
  name: 'Grow Journal Card',
  description: 'Daily notes and observations with tagging and filtering'
});
