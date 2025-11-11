# Release Notes - v1.0

## 🎉 Initial Release

**Release Date:** November 11, 2025

### Overview

Complete suite of 12 custom Lovelace cards designed specifically for cannabis cultivation monitoring and automation in Home Assistant.

### Cards Included

1. **Room Overview Card** - Complete dashboard with sparkline graphs
2. **Environment Monitor Card** - Real-time environmental monitoring
3. **VPD Chart Card** - Interactive vapor pressure deficit analysis
4. **Grow Report Card** - Athena Pro Line feeding schedule integration
5. **Camera Card** - RTSP camera support with scheduled snapshots
6. **Nutrient Dosing Card** - EC/pH monitoring and control
7. **Alert Manager Card** - Centralized alerts with sound notifications
8. **Grow Calendar Card** - Multi-room timeline tracking
9. **Grow Journal Card** - Daily notes and observations
10. **Irrigation Control Card** - Zone management with VWC/EC monitoring
11. **Switch Control Card** - Equipment control with tab organization
12. **Spectrum Sensor Card** - AS7341 spectral visualization

### Key Features

#### Room Overview Card
- Complete at-a-glance dashboard
- Day/week counter from start date
- 24-hour sparkline graphs for all metrics
- Last watering event tracking
- System alerts with color coding
- Dark gradient theme

#### Environment Monitor Card
- Real-time temp, humidity, VPD, CO2 monitoring
- Clickable metric cards
- Modal popup graphs with detailed history
- Min/max/average statistics
- Color-coded metrics

#### Camera Card
- **RTSP camera support** - Direct RTSP stream integration
- **Scheduled snapshots** - Capture at specific times (06:00, 12:00, 18:00, 00:00)
- Standard Home Assistant camera support
- Timelapse creation from snapshots
- Snapshot gallery

#### Switch Control Card
- **Tab-based organization** - Group switches by category
- Visual on/off status with color coding
- Custom icons for each switch
- Responsive grid layout
- Backward compatible with simple switch list

#### Grow Report Card
- **Athena Pro Line integration** - Complete feeding schedule
- **5 organized tabs:**
  - Overview - Current status and environment
  - Targets - EC/pH targets and steering
  - Schedule - Defoliation and harvest events
  - Irrigation - Zone watering status
  - Checklist - Daily tasks and troubleshooting
- Week-by-week guidance
- Automatic calculations

#### Alert Manager Card
- **Sound notifications** - Audio alerts for critical issues
- Multi-room support
- Filter by severity (Critical, Warning, Info)
- Acknowledge and snooze functionality
- Alert history tracking
- Auto-detect alerts from entities

### Technical Improvements

- **Browser cache handling** - Version-based resource loading
- **RTSP support** - Direct camera stream integration
- **Sparkline graphs** - 24-hour trend visualization
- **Modal popups** - Detailed history without leaving view
- **Tab navigation** - Organized content in multiple cards
- **Sound notifications** - Web Audio API integration
- **Responsive design** - Works on mobile and desktop

### Installation

#### HACS (Recommended)
```
1. Open HACS → Frontend
2. Add custom repository: https://github.com/goatboynz/ha-grow-room-cards
3. Install
4. Restart Home Assistant
5. Hard refresh browser (Ctrl+Shift+R)
```

#### Manual
```
1. Download release
2. Copy .js files to /config/www/grow-room-cards/
3. Add resource: /local/grow-room-cards/grow-room-cards.js?v=1.0
4. Restart Home Assistant
5. Hard refresh browser
```

### Configuration Examples

See `EXAMPLE-CONFIGS.yaml` for complete configuration examples.

### Required Setup

**Input Helpers:**
```yaml
input_datetime:
  flower_start_date:
    name: Flower Start Date
    has_date: true
    has_time: false

input_select:
  grow_stage:
    name: Grow Stage
    options:
      - Seedling
      - Vegetative
      - Flowering
      - Harvest
```

**For RTSP Cameras:**
```yaml
shell_command:
  capture_rtsp_snapshot: >
    ffmpeg -rtsp_transport tcp 
    -i {{ rtsp_url }} 
    -frames:v 1 
    {{ filename }}
```

### Breaking Changes

None - this is the initial release.

### Known Issues

- Browser cache can cause old versions to load - use `?v=1.0` in resource URLs
- RTSP cameras require FFmpeg for snapshot capture
- Sparkline graphs require 24 hours of history data

### Troubleshooting

**Cards not appearing:**
1. Clear browser cache (Ctrl+Shift+R)
2. Restart Home Assistant
3. Add `?v=1.0` to resource URL

**Configuration errors:**
1. Check YAML indentation (2 spaces, not tabs)
2. Verify entity IDs in Developer Tools → States
3. See README for detailed troubleshooting

### Recommended Sensors

- **Temperature/Humidity:** SHT31, BME280, DHT22
- **CO2:** SCD30, SCD40, MH-Z19 (NDIR sensors)
- **Light:** AS7341, TSL2591 (spectral sensors)
- **EC/pH:** Atlas Scientific (requires calibration)

### Credits

- Athena Pro Line for feeding schedules
- Home Assistant community
- All contributors and testers

### Support

- **Issues:** https://github.com/goatboynz/ha-grow-room-cards/issues
- **Discussions:** https://github.com/goatboynz/ha-grow-room-cards/discussions
- **Documentation:** See README.md

### License

MIT License - see LICENSE file

### Next Steps

1. Install the cards
2. Configure your sensors
3. Add input helpers
4. Create your first dashboard
5. Join the community discussions

---

**Made with 🌱 for the grow community**

Thank you for using Grow Room Cards!
