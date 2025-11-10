# Grow Room Cards for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/goatboynz/ha-grow-room-cards.svg)](https://github.com/goatboynz/ha-grow-room-cards/releases)
[![License](https://img.shields.io/github/license/goatboynz/ha-grow-room-cards.svg)](LICENSE)

A complete suite of custom cards for monitoring and controlling your grow room environment. All cards share a unified, modern design language and work seamlessly together.

![Grow Room Cards](https://img.shields.io/badge/Cards-5-green) ![Status](https://img.shields.io/badge/Status-Stable-success)

## 🌱 Cards Included

| Card | Type | Purpose |
|------|------|---------|
| 🌡️ **Environment Monitor** | `grow-environment-card` | Monitor temp, humidity, CO2, VPD with history |
| 📊 **VPD Chart** | `grow-vpd-chart-card` | Interactive VPD analysis with color zones |
| 📋 **Grow Report** | `grow-report-card` | Daily/weekly report with Athena Pro Line schedule |
| 📸 **Camera/Timelapse** | `grow-camera-card` | Camera monitoring with timelapse and snapshots |
| 🧪 **Nutrient Dosing** | `grow-nutrient-card` | EC/pH control with automated dosing |
| 🔔 **Alert Manager** | `grow-alert-card` | Centralized alert management for all rooms |
| 🌈 **Spectrum Sensor** | `grow-spectrum-card` | AS7341 spectral visualization |
| 💧 **Irrigation Control** | `grow-irrigation-card` | Manage zones with VWC and EC monitoring |
| 🔌 **Switch Control** | `grow-switch-card` | Control lights, fans, and equipment |

## 📦 Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Go to **Frontend**
3. Click the **⋮** menu and select **Custom repositories**
4. Add repository: `https://github.com/goatboynz/ha-grow-room-cards`
5. Category: **Lovelace**
6. Click **Install**
7. **Restart** Home Assistant

### Manual Installation

1. Download the [latest release](https://github.com/goatboynz/ha-grow-room-cards/releases)
2. Copy all `.js` files to `config/www/grow-room-cards/`
3. Add resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **Add Resource**
   - URL: `/local/grow-room-cards/grow-room-cards.js`
   - Resource type: **JavaScript Module**
4. **Restart** Home Assistant
5. **Clear browser cache** (Ctrl+Shift+R)

## 🚀 Quick Start

### 1. Environment Monitor Card

Monitor your grow room's key environmental parameters with clickable history graphs.

```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.grow_room_temperature
  humidity: sensor.grow_room_humidity
  co2: sensor.grow_room_co2
  vpd: sensor.grow_room_vpd
title: Grow Room Environment
history_hours: 24
```

**Features:**
- Click any metric to view 24-hour history
- Color-coded cards (red=temp, blue=humidity, green=CO2, yellow=VPD)
- Real-time updates

---

### 2. VPD Chart Card

Interactive Vapor Pressure Deficit chart with color-coded zones for optimal plant growth.

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.grow_room_temperature
humidity_sensor: sensor.grow_room_humidity
leaf_temperature_offset: 2
title: VPD Analysis
min_temperature: 15
max_temperature: 35
min_humidity: 30
max_humidity: 90
enable_crosshair: true
enable_zoom: true
```

**Features:**
- Interactive crosshair follows mouse
- Zoom with mouse wheel
- Pan when zoomed (click and drag)
- Displays both Leaf VPD and Room VPD
- Color-coded zones (blue=too low, green=optimal, yellow=flowering, red=too high)

**Optional Configuration:**
```yaml
leaf_temperature_sensor: sensor.leaf_temperature  # Use actual leaf temp sensor
growth_stage: vegetative  # Options: seedling, vegetative, flowering, late_flower
```

---

### 3. Grow Report Card

Comprehensive daily/weekly grow report based on Athena Pro Line feeding schedule.

```yaml
type: custom:grow-report-card
room_name: Flower Room 1
start_date_entity: input_datetime.f1_start_date
temperature_entity: sensor.f1_temperature
humidity_entity: sensor.f1_humidity
vpd_entity: sensor.f1_vpd
co2_entity: sensor.f1_co2
lights_entity: switch.f1_lights
light_hours: 12
```

**Features:**
- Automatic week/day calculation from start date
- Week-by-week Athena Pro Line targets
- Event scheduling (deleaf, lollipop, harvest)
- Smart alerts for out-of-range parameters
- Daily grower checklist
- Troubleshooting tips from Athena Handbook

**Required Setup:**
```yaml
# configuration.yaml
input_datetime:
  f1_start_date:
    name: Flower Room 1 Start Date
    has_date: true
    has_time: false
```

See [REPORT-CARD-SETUP.md](REPORT-CARD-SETUP.md) for complete setup guide.

---

### 4. Switch Control Card

Stylish control panel for all your grow room equipment.

```yaml
type: custom:grow-switch-card
title: Equipment Control
switches:
  - entity: switch.grow_light
    name: Main Light
    type: light
  - entity: switch.exhaust_fan
    name: Exhaust Fan
    type: fan
  - entity: switch.circulation_fan
    name: Circulation Fan
    type: fan
  - entity: switch.humidifier
    name: Humidifier
    type: humidifier
  - entity: switch.dehumidifier
    name: Dehumidifier
    type: dehumidifier
  - entity: switch.heater
    name: Heater
    type: heater
```

**Supported Device Types:**
- `light` 💡 - Grow lights
- `fan` 🌀 - Fans
- `humidifier` 💨 - Humidifiers
- `dehumidifier` 🌬️ - Dehumidifiers
- `heater` 🔥 - Heaters
- `cooler` ❄️ - Coolers
- `pump` ⚡ - Pumps
- `valve` 🚰 - Valves

**Features:**
- One-click toggle
- Visual ON/OFF states
- Custom icons per device type
- Hover effects

---

### 5. Irrigation Control Card

Manage watering zones with soil moisture (VWC) and nutrient (EC) monitoring.

```yaml
type: custom:grow-irrigation-card
title: Irrigation System
history_hours: 24
zones:
  - entity: switch.irrigation_zone_1
    name: Main Bed
    vwc_sensor: sensor.zone_1_vwc
    ec_sensor: sensor.zone_1_ec
  - entity: switch.irrigation_zone_2
    name: Side Bed
    vwc_sensor: sensor.zone_2_vwc
    ec_sensor: sensor.zone_2_ec
  - entity: switch.irrigation_zone_3
    name: Seedling Tray
    vwc_sensor: sensor.zone_3_vwc
```

**Features:**
- Multiple zone support
- Start/Stop controls per zone
- Real-time VWC (Volumetric Water Content) display
- Real-time EC (Electrical Conductivity) display
- Click graph buttons to view 24-hour trends
- Active zones highlighted in green

**Sensor Units:**
- VWC: % (percentage)
- EC: mS/cm (milliSiemens per centimeter)

---

### 6. Spectrum Sensor Card

Visualize light spectrum from AS7341 spectral sensor.

```yaml
type: custom:grow-spectrum-card
entity: sensor.as7341_spectrum
title: Light Spectrum Analysis
show_wavelengths: true
```

**Features:**
- 10-channel spectral display (415nm to NIR)
- Rainbow gradient visualization
- Smooth interpolation
- Hover tooltips with wavelength info

**Channels:**
- 415nm (Violet), 445nm (Blue), 480nm (Cyan)
- 515nm (Green), 555nm (Yellow-Green), 590nm (Yellow)
- 630nm (Orange), 680nm (Red)
- Clear (full spectrum), NIR (Near Infrared)

---

## 📖 Complete Dashboard Example

```yaml
title: Grow Room
views:
  - title: Main
    path: main
    cards:
      # Environment monitoring
      - type: custom:grow-environment-card
        entities:
          temperature: sensor.grow_room_temperature
          humidity: sensor.grow_room_humidity
          co2: sensor.grow_room_co2
          vpd: sensor.grow_room_vpd
        title: Environment
        
      # VPD Chart
      - type: custom:grow-vpd-chart-card
        temperature_sensor: sensor.grow_room_temperature
        humidity_sensor: sensor.grow_room_humidity
        leaf_temperature_offset: 2
        title: VPD Analysis
        
      # Equipment control
      - type: horizontal-stack
        cards:
          - type: custom:grow-switch-card
            title: Equipment
            switches:
              - entity: switch.grow_light
                name: Main Light
                type: light
              - entity: switch.exhaust_fan
                name: Exhaust
                type: fan
              - entity: switch.humidifier
                type: humidifier
              - entity: switch.dehumidifier
                type: dehumidifier
                
          # Irrigation
          - type: custom:grow-irrigation-card
            title: Watering
            zones:
              - entity: switch.irrigation_zone_1
                name: Main Bed
                vwc_sensor: sensor.zone_1_vwc
                ec_sensor: sensor.zone_1_ec
                
      # Light spectrum
      - type: custom:grow-spectrum-card
        entity: sensor.as7341_spectrum
        title: Light Spectrum
```

## 🎨 Features

### Unified Design
- Consistent styling across all cards
- Smooth animations and transitions
- Responsive layout (mobile-friendly)
- Dark/light mode support
- Uses Home Assistant theme colors

### Interactive Elements
- Clickable metrics for history graphs
- Hover tooltips with detailed info
- Zoom and pan on VPD chart
- Visual feedback on all controls
- Real-time updates

### Performance
- Lightweight (~50KB total)
- Canvas-based charts for smooth rendering
- Efficient API calls
- Cached history data
- Fast load times

## 📚 Documentation

- **[Wiki Home](../../wiki)** - Complete documentation
- **[Installation Guide](../../wiki/Installation)** - Detailed setup instructions
- **[Card Configuration](../../wiki/Card-Configuration)** - All configuration options
- **[Troubleshooting](../../wiki/Troubleshooting)** - Common issues and solutions
- **[Examples](../../wiki/Examples)** - Real-world configurations

## 🐛 Troubleshooting

### Cards not showing
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console (F12) for errors
3. Verify resource is added in Settings → Dashboards → Resources

### "Custom element doesn't exist"
- Resource wasn't loaded properly
- Clear cache and hard refresh
- Check resource URL is correct: `/local/grow-room-cards/grow-room-cards.js`

### Entities showing as "unavailable"
- Verify entity IDs are correct
- Check entities exist in Developer Tools → States
- Ensure sensors are working and reporting data

### History graphs not loading
- Ensure recorder is enabled in Home Assistant
- Check entities have history in Developer Tools → History
- Verify API access is working

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## ⭐ Support

If you find these cards useful, please consider:
- ⭐ Starring this repository
- 🐛 Reporting issues
- 💡 Suggesting new features
- 📖 Improving documentation

## 🔗 Links

- [GitHub Repository](https://github.com/goatboynz/ha-grow-room-cards)
- [Issues](https://github.com/goatboynz/ha-grow-room-cards/issues)
- [Discussions](https://github.com/goatboynz/ha-grow-room-cards/discussions)
- [Wiki](../../wiki)

---

Made with 🌱 for the Home Assistant community
