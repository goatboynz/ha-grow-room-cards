class GrowCameraCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.showingTimelapse = false;
    this.currentSnapshotIndex = 0;
    this.snapshots = [];
  }

  setConfig(config) {
    if (!config.camera_entity && !config.rtsp_url) {
      throw new Error('Please define either camera_entity or rtsp_url');
    }
    
    this.config = {
      ...config,
      title: config.title || 'Grow Camera',
      refresh_interval: config.refresh_interval || 5000,
      snapshot_times: config.snapshot_times || ['06:00', '12:00', '18:00', '00:00'],
      snapshot_storage: config.snapshot_storage || '/config/www/snapshots/',
      use_rtsp: !!config.rtsp_url,
      rtsp_url: config.rtsp_url,
      rtsp_username: config.rtsp_username,
      rtsp_password: config.rtsp_password
    };
    
    this.render();
    if (!this.config.use_rtsp) {
      this.startRefresh();
    }
    this.scheduleSnapshotCaptures();
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
        .timelapse-info {
          padding: 12px 16px;
          background: var(--secondary-background-color);
          border-top: 1px solid var(--divider-color);
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .timelapse-schedule {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .time-badge {
          padding: 4px 10px;
          background: var(--primary-color);
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
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
          
          <div class="timelapse-info">
            <strong>📸 Automatic Timelapse Schedule</strong>
            <div class="timelapse-schedule" id="timelapse-schedule"></div>
            <div style="margin-top: 8px; font-size: 11px;">
              Photos are automatically captured at scheduled times and saved to ${this.config.timelapse_storage}
            </div>
          </div>
        </div>
      </ha-card>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Render timelapse schedule
    const scheduleEl = this.shadowRoot.getElementById('timelapse-schedule');
    scheduleEl.innerHTML = this.config.timelapse_times.map(time => 
      `<span class="time-badge">${time}</span>`
    ).join('');
  }

  scheduleSnapshotCaptures() {
    // Check every minute if it's time to capture
    setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (this.config.snapshot_times.includes(currentTime)) {
        this.captureSnapshot();
      }
    }, 60000); // Check every minute
  }

  captureSnapshot() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const entityName = this.config.camera_entity ? this.config.camera_entity.split('.')[1] : 'rtsp_camera';
    const filename = `${this.config.snapshot_storage}${entityName}_${timestamp}.jpg`;
    
    if (this.config.use_rtsp) {
      // For RTSP, we need to use a service that can capture from RTSP stream
      // This requires a custom integration or script
      this._hass.callService('shell_command', 'capture_rtsp_snapshot', {
        rtsp_url: this.config.rtsp_url,
        filename: filename,
        username: this.config.rtsp_username,
        password: this.config.rtsp_password
      });
    } else {
      // Standard Home Assistant camera snapshot
      this._hass.callService('camera', 'snapshot', {
        entity_id: this.config.camera_entity,
        filename: filename
      });
    }
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

    // Motion detection removed - not needed for RTSP cameras

    // Update time
    const timeEl = this.shadowRoot.getElementById('camera-time');
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  updateCameraImage() {
    const imageEl = this.shadowRoot.getElementById('camera-image');
    
    if (this.config.use_rtsp) {
      // For RTSP, we need to use a proxy or convert to HLS/WebRTC
      // Option 1: Use go2rtc or similar proxy
      // Option 2: Use snapshot refresh
      // For now, we'll use periodic snapshots
      if (this.config.rtsp_snapshot_url) {
        const timestamp = new Date().getTime();
        imageEl.src = `${this.config.rtsp_snapshot_url}?t=${timestamp}`;
      } else {
        imageEl.src = '/local/snapshots/latest.jpg?t=' + new Date().getTime();
      }
    } else {
      const cameraEntity = this._hass.states[this.config.camera_entity];
      if (!cameraEntity) return;

      const entityPicture = cameraEntity.attributes.entity_picture;
      
      if (entityPicture) {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        imageEl.src = `${entityPicture}&t=${timestamp}`;
      }
    }
  }



  showNoCameraMessage() {
    const container = this.shadowRoot.getElementById('camera-container');
    container.innerHTML = '<div class="no-camera">Camera not available</div>';
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
      refresh_interval: 5000,
      timelapse_times: ['06:00', '12:00', '18:00', '00:00'],
      timelapse_storage: '/config/www/timelapse/'
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
