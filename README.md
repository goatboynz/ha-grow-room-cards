# Grow Room Cards for Home Assistant

A comprehensive suite of custom Lovelace cards designed specifically for cannabis cultivation monitoring and automation in Home Assistant.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/goatboynz/ha-grow-room-cards.svg)](https://github.com/goatboynz/ha-grow-room-cards/releases)
[![License](https://img.shields.io/github/license/goatboynz/ha-grow-room-cards.svg)](LICENSE)

## Features

- 🌸 **Room Overview Dashboard** - Complete at-a-glance view with sparkline graphs
- 🌡️ **Environment Monitoring** - Real-time temp, humidity, VPD, CO2 tracking
- 📊 **VPD Chart** - Interactive vapor pressure deficit analysis
- 📋 **Grow Report** - Athena Pro Line feeding schedule integration
- 📸 **Camera Support** - RTSP cameras with scheduled snapshots
- 🧪 **Nutrient Management** - EC/pH monitoring and dosing control
- 🔔 **Alert System** - Centralized alert management with sound notifications
- 📅 **Grow Calendar** - Multi-room timeline and event tracking
- 📝 **Grow Journal** - Daily notes and observations
- 💧 **Irrigation Control** - Zone management with VWC/EC monitoring
- 🔌 **Switch Control** - Organized equipment control with tabs
- 🌈 **Spectrum Analysis** - AS7341 sensor visualization

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Go to **Frontend**
3. Click **⋮** menu → **Custom repositories**
4. Add: `https://github.com/goatboynz/ha-grow-room-cards`
5. Category: **Lovelace**
6. Click **Install**
7. **Restart** Home Assistant
8. **Hard refresh** browser (Ctrl+Shift+R)

### Manual Installation

1. Download the [latest release](https://github.com/goatboynz/ha-grow-room-cards/releases)
2. Copy all `.js` files to `/config/www/grow-room-cards/`
3. Add resources in **Settings** → **Dashboards** → **Resources**:
   - URL: `/local/grow-room-cards/grow-room-cards.js?v=1.0`
   - Type: **JavaScript Module**
4. **Restart** Home Assistant
5. **Hard refresh** browser (Ctrl+Shift+R)

## Quick Start

### 1. Create Required Input Helpers

Add to `configuration.yaml`:

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
    initial: Flowering
```

### 2. Add Your First Card

Edit your dashboard and add:

```yaml
type: custom:grow-room-overview-card
title: Main Tent
room_name: Main Tent
start_date_entity: input_datetime.flower_start_date
lights_entity: light.grow_lights
temperature_entity: sensor.grow_room_temperature
humidity_entity: sensor.grow_room_humidity
vpd_entity: sensor.grow_room_vpd
co2_entity: sensor.grow_room_co2
show_sparklines: true
```

## Card Configurations

### Room Overview Card

Complete dashboard with metrics, day counter, and alerts.

```yaml
type: custom:grow-room-overview-card
title: F2 Flowering Room
room_name: F2 Flowering Room
start_date_entity: input_datetime.f2_flower_start
stage_entity: input_select.f2_grow_stage
lights_entity: switch.f2_light
temperature_entity: sensor.f2_temperature
humidity_entity: sensor.f2_humidity
vpd_entity: sensor.f2_vpd
leaf_vpd_entity: sensor.f2_leaf_vpd
co2_entity: sensor.f2_co2
last_watering_entity: sensor.f2_last_watering
alert_entities:
  - binary_sensor.f2_high_temp
  - binary_sensor.f2_low_humidity
show_sparklines: true
light_hours: 12
```

### Environment Monitor Card

Real-time monitoring with clickable history graphs.

```yaml
type: custom:grow-environment-card
title: Environment Monitor
entities:
  temperature: sensor.grow_room_temperature
  humidity: sensor.grow_room_humidity
  vpd: sensor.grow_room_vpd
  co2: sensor.grow_room_co2
```

### VPD Chart Card

Interactive VPD analysis with color-coded zones.

```yaml
type: custom:grow-vpd-chart-card
title: VPD Analysis
temperature_entity: sensor.grow_room_temperature
humidity_entity: sensor.grow_room_humidity
vpd_entity: sensor.grow_room_vpd
leaf_offset: 2
```

### Grow Report Card

Daily/weekly reports with Athena Pro Line schedule.

```yaml
type: custom:grow-report-card
title: Grow Report
room_name: Main Tent
start_date_entity: input_datetime.flower_start_date
temperature_entity: sensor.grow_room_temperature
humidity_entity: sensor.grow_room_humidity
vpd_entity: sensor.grow_room_vpd
co2_entity: sensor.grow_room_co2
lights_entity: light.grow_lights
zone_1_entity: switch.irrigation_zone_1
zone_2_entity: switch.irrigation_zone_2
light_hours: 12
feed_system: athena_pro
grow_medium: coco
```

### Camera Card

RTSP camera support with scheduled snapshots.

**Standard Camera:**
```yaml
type: custom:grow-camera-card
title: Grow Camera
camera_entity: camera.grow_room
snapshot_times:
  - "06:00"
  - "12:00"
  - "18:00"
  - "00:00"
snapshot_storage: /config/www/snapshots/
```

**RTSP Camera:**
```yaml
type: custom:grow-camera-card
title: Grow Camera
rtsp_url: "rtsp://192.168.1.100:554/stream"
rtsp_username: admin
rtsp_password: password
rtsp_snapshot_url: "http://192.168.1.100/snapshot.jpg"
snapshot_times:
  - "06:00"
  - "12:00"
  - "18:00"
  - "00:00"
snapshot_storage: /config/www/snapshots/
```

**Required for RTSP (add to configuration.yaml):**
```yaml
shell_command:
  capture_rtsp_snapshot: >
    ffmpeg -rtsp_transport tcp 
    -i {{ rtsp_url }} 
    -frames:v 1 
    {{ filename }}
```

### Switch Control Card

Equipment control with optional category tabs.

**Simple:**
```yaml
type: custom:grow-switch-card
title: Equipment Control
switches:
  - entity: light.grow_lights
    name: Main Lights
    icon: "mdi:lightbulb"
  - entity: switch.exhaust_fan
    name: Exhaust Fan
    icon: "mdi:fan"
```

**With Tabs:**
```yaml
type: custom:grow-switch-card
title: Equipment Control
tabs:
  - name: Lighting
    switches:
      - entity: light.grow_lights
        name: Main Lights
        icon: "mdi:lightbulb"
      - entity: light.uv_lights
        name: UV Lights
        icon: "mdi:lightbulb-outline"
  
  - name: Climate
    switches:
      - entity: switch.exhaust_fan
        name: Exhaust Fan
        icon: "mdi:fan"
      - entity: switch.humidifier
        name: Humidifier
        icon: "mdi:water"
  
  - name: Irrigation
    switches:
      - entity: switch.irrigation_pump
        name: Main Pump
        icon: "mdi:water-pump"
```

### Alert Manager Card

Centralized alert management with sound notifications.

```yaml
type: custom:grow-alert-card
title: Alert Manager
rooms:
  - Main Tent
  - Veg Room
enable_sound: true
show_history: true
alert_entities:
  - binary_sensor.high_temp_alert
  - binary_sensor.low_humidity_alert
notification_service: notify.mobile_app
```

### Nutrient Dosing Card

EC/pH control with automated dosing.

```yaml
type: custom:grow-nutrient-card
title: Nutrient Management
ec_sensor: sensor.reservoir_ec
ph_sensor: sensor.reservoir_ph
target_ec: 2.0
target_ph: 5.8
ec_up_pump: switch.ec_up_pump
ec_down_pump: switch.ec_down_pump
ph_up_pump: switch.ph_up_pump
ph_down_pump: switch.ph_down_pump
reservoir_level: sensor.reservoir_level
```

### Irrigation Control Card

Zone management with VWC and EC monitoring.

```yaml
type: custom:grow-irrigation-card
title: Irrigation Control
zones:
  - name: Zone 1
    switch: switch.irrigation_zone_1
    vwc_sensor: sensor.zone_1_vwc
    ec_sensor: sensor.zone_1_ec
  - name: Zone 2
    switch: switch.irrigation_zone_2
    vwc_sensor: sensor.zone_2_vwc
    ec_sensor: sensor.zone_2_ec
schedule_entity: input_boolean.irrigation_schedule
```

### Grow Calendar Card

Multi-room timeline and event tracking.

```yaml
type: custom:grow-calendar-card
title: Grow Calendar
rooms:
  - name: Main Tent
    start_date_entity: input_datetime.main_tent_start
    color: "#4CAF50"
  - name: Veg Room
    start_date_entity: input_datetime.veg_room_start
    color: "#2196F3"
events:
  - name: Defoliation
    day: 21
    icon: "mdi:leaf"
  - name: Harvest Window
    day: 56
    icon: "mdi:cannabis"
```

### Grow Journal Card

Daily notes and observations.

```yaml
type: custom:grow-journal-card
title: Grow Journal
room_name: Main Tent
storage_entity: input_text.grow_journal_storage
enable_photos: true
tags:
  - Feeding
  - Defoliation
  - Training
  - Observation
  - Problem
```

### Spectrum Sensor Card

AS7341 spectral visualization.

```yaml
type: custom:grow-spectrum-card
title: Light Spectrum
sensor_prefix: sensor.as7341
channels:
  - 415nm
  - 445nm
  - 480nm
  - 515nm
  - 555nm
  - 590nm
  - 630nm
  - 680nm
show_par: true
show_ratios: true
```

## Troubleshooting

### Cards Not Appearing

1. **Clear browser cache:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Restart Home Assistant:** Developer Tools → YAML → Restart
3. **Check resources:** Settings → Dashboards → Resources
4. **Add version to URL:** `/local/grow-room-cards/grow-room-cards.js?v=1.0`

### Configuration Errors

**"Please define camera_entity"**
- Using RTSP? Use `rtsp_url` instead of `camera_entity`
- Clear browser cache completely

**"Please define at least one switch"**
- Check YAML indentation (use 2 spaces, not tabs)
- Ensure switches array is not empty
- Verify entity IDs exist in Developer Tools → States

**"Custom element doesn't exist"**
- Resource not loaded - check URL in Resources
- Clear browser cache and hard refresh
- Restart Home Assistant

### YAML Indentation

Each level must be indented by exactly 2 spaces:

```yaml
type: custom:grow-switch-card
title: Equipment
tabs:
  - name: Lighting
    switches:
      - entity: light.grow_lights
        name: Main Lights
```

### Entity Verification

Check entities exist:
1. Go to **Developer Tools** → **States**
2. Search for your entity
3. Copy exact entity ID

## Example Dashboard

```yaml
views:
  - title: Grow Room
    cards:
      # Room Overview
      - type: custom:grow-room-overview-card
        room_name: Main Tent
        start_date_entity: input_datetime.flower_start
        lights_entity: light.grow_lights
        temperature_entity: sensor.temperature
        humidity_entity: sensor.humidity
        vpd_entity: sensor.vpd
        co2_entity: sensor.co2
      
      # Environment Details
      - type: horizontal-stack
        cards:
          - type: custom:grow-environment-card
            entities:
              temperature: sensor.temperature
              humidity: sensor.humidity
              vpd: sensor.vpd
              co2: sensor.co2
          
          - type: custom:grow-vpd-chart-card
            temperature_entity: sensor.temperature
            humidity_entity: sensor.humidity
            vpd_entity: sensor.vpd
      
      # Controls
      - type: horizontal-stack
        cards:
          - type: custom:grow-switch-card
            title: Equipment
            tabs:
              - name: Lighting
                switches:
                  - entity: light.grow_lights
                    name: Main Lights
                    icon: "mdi:lightbulb"
              - name: Climate
                switches:
                  - entity: switch.exhaust_fan
                    name: Exhaust
                    icon: "mdi:fan"
          
          - type: custom:grow-irrigation-card
            zones:
              - name: Zone 1
                switch: switch.zone_1
      
      # Monitoring
      - type: custom:grow-camera-card
        camera_entity: camera.grow_room
      
      # Management
      - type: horizontal-stack
        cards:
          - type: custom:grow-report-card
            room_name: Main Tent
            start_date_entity: input_datetime.flower_start
            temperature_entity: sensor.temperature
            humidity_entity: sensor.humidity
            vpd_entity: sensor.vpd
            co2_entity: sensor.co2
            lights_entity: light.grow_lights
          
          - type: custom:grow-alert-card
            rooms:
              - Main Tent
```

## Recommended Sensors

| Metric | Sensor | Notes |
|--------|--------|-------|
| Temperature | SHT31, BME280, DHT22 | ±0.3°C accuracy |
| Humidity | SHT31, BME280 | ±2% RH accuracy |
| CO2 | SCD30, SCD40, MH-Z19 | NDIR sensors preferred |
| Light | AS7341, TSL2591 | Spectral sensors for PAR |
| EC/pH | Atlas Scientific | Requires calibration |

## Support

- **Issues:** [GitHub Issues](https://github.com/goatboynz/ha-grow-room-cards/issues)
- **Discussions:** [GitHub Discussions](https://github.com/goatboynz/ha-grow-room-cards/discussions)
- **Home Assistant Community:** [Forum Thread](https://community.home-assistant.io/)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Created for the Home Assistant grow room automation community.

Special thanks to:
- Athena Pro Line for feeding schedules
- Home Assistant community
- All contributors and testers

## Changelog

### v1.0 (2025-11-11)
- Initial release
- 12 custom cards for grow room automation
- RTSP camera support
- Athena Pro Line integration
- Multi-room support
- Sound notifications
- Sparkline graphs
- Tab-based organization

---

**Made with 🌱 for the grow community**
