class GrowCameraCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.showingTimelapse = false;
    this.currentSnapshotIndex = 0;
    this.snapshots = [];
  }

  setConfig(config) {
    if (!config.camera_entity) {
      throw new Error('Please define camera_entity');
    }
    
    this.config = {
      ...config,
      title: config.title || 'Grow Camera',
      show_motion_detection: config.show_motion_detection !== false,
      show_snapshots: config.show_snapshots !== false,
      snapshot_count: config.snapshot_count || 10,
      refresh_interval: config.refresh_interval || 5000
    };
    
    this.render();
    this.startRefresh();
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
        .camera-container {
          position: relative;
          width: 100%;
          background: #000;
        }
        .camera-image {
          width: 100%;
          display: block;
          min-height: 200px;
        }
        .camera-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 16px;
          color: white;
        }
        .camera-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        .controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          padding: 16px;
          background: var(--secondary-background-color);
        }
        .control-button {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .control-button:hover {
          opacity: 0.8;
          transform: translateY(-2px);
        }
        .control-button:active {
          transform: translateY(0);
        }
        .control-button.secondary {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color);
        }
        .snapshots-container {
          padding: 16px;
          display: none;
        }
        .snapshots-container.active {
          display: block;
        }
        .snapshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .snapshot-item {
          position: relative;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .snapshot-item:hover {
          border-color: var(--primary-color);
          transform: scale(1.05);
        }
        .snapshot-item img {
          width: 100%;
          display: block;
        }
        .snapshot-date {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          font-size: 10px;
          text-align: center;
        }
        .timelapse-view {
          display: none;
          padding: 16px;
        }
        .timelapse-view.active {
          display: block;
        }
        .timelapse-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          margin-top: 12px;
        }
        .timelapse-button {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .timelapse-slider {
          flex: 1;
          max-width: 400px;
        }
        .motion-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .motion-indicator.detected {
          background: #FF5252;
          color: white;
          animation: pulse 1s infinite;
        }
        .motion-indicator.clear {
          background: #4CAF50;
          color: white;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-online {
          background: #4CAF50;
          color: white;
        }
        .status-offline {
          background: #757575;
          color: white;
        }
        .comparison-container {
          display: none;
          padding: 16px;
        }
        .comparison-container.active {
          display: block;
        }
        .comparison-slider {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 8px;
        }
        .comparison-images {
          position: relative;
          width: 100%;
        }
        .comparison-images img {
          width: 100%;
          display: block;
        }
        .comparison-after {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .no-camera {
          padding: 40px;
          text-align: center;
          color: var(--secondary-text-color);
        }
      </style>
      <ha-card>
        <div class="card-header">
          <span>${this.config.title}</span>
          <div id="camera-status"></div>
        </div>
        
        <div class="main-view" id="main-view">
          <div class="camera-container" id="camera-container">
            <img class="camera-image" id="camera-image" alt="Camera feed">
            <div class="camera-overlay">
              <div class="camera-info">
                <span id="camera-time">--:--</span>
                <span id="motion-status"></span>
              </div>
            </div>
          </div>
          
          <div class="controls">
            <button class="control-button" id="snapshot-btn">
              <ha-icon icon="mdi:camera"></ha-icon>
              Snapshot
            </button>
            <button class="control-button secondary" id="view-snapshots-btn">
              <ha-icon icon="mdi:image-multiple"></ha-icon>
              Gallery
            </button>
            <button class="control-button secondary" id="timelapse-btn">
              <ha-icon icon="mdi:timelapse"></ha-icon>
              Timelapse
            </button>
            <button class="control-button secondary" id="compare-btn">
              <ha-icon icon="mdi:compare"></ha-icon>
              Compare
            </button>
          </div>
        </div>

        <div class="snapshots-container" id="snapshots-view">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0;">Snapshot Gallery</h3>
            <button class="control-button secondary" id="back-from-snapshots">
              <ha-icon icon="mdi:arrow-left"></ha-icon>
              Back
            </button>
          </div>
          <div class="snapshots-grid" id="snapshots-grid"></div>
        </div>

        <div class="timelapse-view" id="timelapse-view">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0;">Timelapse</h3>
            <button class="control-button secondary" id="back-from-timelapse">
              <ha-icon icon="mdi:arrow-left"></ha-icon>
              Back
            </button>
          </div>
          <div class="camera-container">
            <img class="camera-image" id="timelapse-image" alt="Timelapse frame">
          </div>
          <div class="timelapse-controls">
            <button class="timelapse-button" id="play-timelapse">
              <ha-icon icon="mdi:play"></ha-icon>
            </button>
            <input type="range" class="timelapse-slider" id="timelapse-slider" min="0" max="100" value="0">
            <span id="timelapse-counter">0 / 0</span>
          </div>
        </div>

        <div class="comparison-container" id="comparison-view">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0;">Before/After Comparison</h3>
            <button class="control-button secondary" id="back-from-comparison">
              <ha-icon icon="mdi:arrow-left"></ha-icon>
              Back
            </button>
          </div>
          <div class="comparison-slider" id="comparison-slider">
            <div class="comparison-images">
              <img id="comparison-before" alt="Before">
              <div class="comparison-after" id="comparison-after-container">
                <img id="comparison-after" alt="After">
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Snapshot button
    this.shadowRoot.getElementById('snapshot-btn').addEventListener('click', () => {
      this.takeSnapshot();
    });

    // View snapshots
    this.shadowRoot.getElementById('view-snapshots-btn').addEventListener('click', () => {
      this.showSnapshots();
    });

    // Timelapse
    this.shadowRoot.getElementById('timelapse-btn').addEventListener('click', () => {
      this.showTimelapse();
    });

    // Compare
    this.shadowRoot.getElementById('compare-btn').addEventListener('click', () => {
      this.showComparison();
    });

    // Back buttons
    this.shadowRoot.getElementById('back-from-snapshots').addEventListener('click', () => {
      this.showMainView();
    });

    this.shadowRoot.getElementById('back-from-timelapse').addEventListener('click', () => {
      this.showMainView();
    });

    this.shadowRoot.getElementById('back-from-comparison').addEventListener('click', () => {
      this.showMainView();
    });

    // Timelapse controls
    this.shadowRoot.getElementById('play-timelapse').addEventListener('click', () => {
      this.toggleTimelapsePlay();
    });

    this.shadowRoot.getElementById('timelapse-slider').addEventListener('input', (e) => {
      this.updateTimelapseFrame(parseInt(e.target.value));
    });
  }

  startRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      if (!this.showingTimelapse) {
        this.updateCameraImage();
      }
    }, this.config.refresh_interval);
  }

  updateCard() {
    if (!this._hass) return;

    const cameraEntity = this._hass.states[this.config.camera_entity];
    
    if (!cameraEntity) {
      this.showNoCameraMessage();
      return;
    }

    // Update camera status
    const statusEl = this.shadowRoot.getElementById('camera-status');
    const isOnline = cameraEntity.state !== 'unavailable';
    statusEl.innerHTML = `<span class="status-badge ${isOnline ? 'status-online' : 'status-offline'}">${isOnline ? 'Online' : 'Offline'}</span>`;

    // Update camera image
    this.updateCameraImage();

    // Update motion detection
    if (this.config.show_motion_detection && this.config.motion_entity) {
      this.updateMotionStatus();
    }

    // Update time
    const timeEl = this.shadowRoot.getElementById('camera-time');
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  updateCameraImage() {
    const cameraEntity = this._hass.states[this.config.camera_entity];
    if (!cameraEntity) return;

    const imageEl = this.shadowRoot.getElementById('camera-image');
    const entityPicture = cameraEntity.attributes.entity_picture;
    
    if (entityPicture) {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      imageEl.src = `${entityPicture}&t=${timestamp}`;
    }
  }

  updateMotionStatus() {
    const motionEntity = this._hass.states[this.config.motion_entity];
    const motionEl = this.shadowRoot.getElementById('motion-status');
    
    if (motionEntity) {
      const isDetected = motionEntity.state === 'on';
      motionEl.innerHTML = `
        <span class="motion-indicator ${isDetected ? 'detected' : 'clear'}">
          <ha-icon icon="mdi:motion-sensor"></ha-icon>
          ${isDetected ? 'Motion' : 'Clear'}
        </span>
      `;
    }
  }

  showNoCameraMessage() {
    const container = this.shadowRoot.getElementById('camera-container');
    container.innerHTML = '<div class="no-camera">Camera not available</div>';
  }

  takeSnapshot() {
    if (!this._hass) return;

    this._hass.callService('camera', 'snapshot', {
      entity_id: this.config.camera_entity,
      filename: `/config/www/snapshots/${this.config.camera_entity.split('.')[1]}_${Date.now()}.jpg`
    });

    // Show notification
    this._hass.callService('persistent_notification', 'create', {
      message: 'Snapshot saved',
      title: 'Camera Snapshot'
    });
  }

  showSnapshots() {
    this.shadowRoot.getElementById('main-view').style.display = 'none';
    this.shadowRoot.getElementById('snapshots-view').classList.add('active');
    this.loadSnapshots();
  }

  showTimelapse() {
    this.shadowRoot.getElementById('main-view').style.display = 'none';
    this.shadowRoot.getElementById('timelapse-view').classList.add('active');
    this.showingTimelapse = true;
    this.loadTimelapseFrames();
  }

  showComparison() {
    this.shadowRoot.getElementById('main-view').style.display = 'none';
    this.shadowRoot.getElementById('comparison-view').classList.add('active');
    this.loadComparisonImages();
  }

  showMainView() {
    this.shadowRoot.getElementById('main-view').style.display = 'block';
    this.shadowRoot.getElementById('snapshots-view').classList.remove('active');
    this.shadowRoot.getElementById('timelapse-view').classList.remove('active');
    this.shadowRoot.getElementById('comparison-view').classList.remove('active');
    this.showingTimelapse = false;
    
    if (this.timelapseInterval) {
      clearInterval(this.timelapseInterval);
      this.timelapseInterval = null;
    }
  }

  loadSnapshots() {
    // This would load actual snapshots from storage
    // For now, show placeholder
    const grid = this.shadowRoot.getElementById('snapshots-grid');
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--secondary-text-color);">No snapshots available. Take some snapshots to see them here.</div>';
  }

  loadTimelapseFrames() {
    // This would load actual timelapse frames
    // For now, show current camera
    const imageEl = this.shadowRoot.getElementById('timelapse-image');
    const cameraEntity = this._hass.states[this.config.camera_entity];
    
    if (cameraEntity && cameraEntity.attributes.entity_picture) {
      imageEl.src = cameraEntity.attributes.entity_picture;
    }
    
    this.shadowRoot.getElementById('timelapse-counter').textContent = '0 / 0';
  }

  toggleTimelapsePlay() {
    const playBtn = this.shadowRoot.getElementById('play-timelapse');
    
    if (this.timelapseInterval) {
      clearInterval(this.timelapseInterval);
      this.timelapseInterval = null;
      playBtn.innerHTML = '<ha-icon icon="mdi:play"></ha-icon>';
    } else {
      playBtn.innerHTML = '<ha-icon icon="mdi:pause"></ha-icon>';
      this.timelapseInterval = setInterval(() => {
        const slider = this.shadowRoot.getElementById('timelapse-slider');
        let value = parseInt(slider.value) + 1;
        if (value > parseInt(slider.max)) {
          value = 0;
        }
        slider.value = value;
        this.updateTimelapseFrame(value);
      }, 200);
    }
  }

  updateTimelapseFrame(index) {
    this.currentSnapshotIndex = index;
    this.shadowRoot.getElementById('timelapse-counter').textContent = `${index} / ${this.snapshots.length}`;
  }

  loadComparisonImages() {
    // Load before/after images
    const cameraEntity = this._hass.states[this.config.camera_entity];
    
    if (cameraEntity && cameraEntity.attributes.entity_picture) {
      this.shadowRoot.getElementById('comparison-before').src = cameraEntity.attributes.entity_picture;
      this.shadowRoot.getElementById('comparison-after').src = cameraEntity.attributes.entity_picture;
    }
  }

  disconnectedCallback() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.timelapseInterval) {
      clearInterval(this.timelapseInterval);
    }
  }

  getCardSize() {
    return 4;
  }

  static getStubConfig() {
    return {
      camera_entity: 'camera.grow_room',
      motion_entity: 'binary_sensor.grow_room_motion',
      show_motion_detection: true,
      show_snapshots: true,
      refresh_interval: 5000
    };
  }
}

customElements.define('grow-camera-card', GrowCameraCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-camera-card',
  name: 'Grow Camera Card',
  description: 'Camera monitoring with timelapse and snapshot gallery'
});
