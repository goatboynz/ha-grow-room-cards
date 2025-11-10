# Grow Room Cards for Home Assistant

A complete suite of custom cards for monitoring and controlling your grow room environment.

## Cards Included

1. **Environment Monitor Card** - Display temp, humidity, CO2, and VPD with clickable history graphs
2. **VPD Chart Card** - Interactive VPD chart with color-coded zones
3. **Spectrum Sensor Card** - AS7341 spectral sensor visualization
4. **Irrigation Control Card** - Manage zones/pumps with VWC and EC graphs
5. **Switch Control Card** - Stylish control panel for lights, fans, and equipment

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click the menu (three dots) and select "Custom repositories"
4. Add this repository URL
5. Install "Grow Room Cards"

### Manual Installation

1. Download the latest release
2. Copy the `grow-room-cards` folder to your `config/www/` directory
3. Add the resource in Home Assistant:
   - Go to Settings → Dashboards → Resources
   - Add `/local/grow-room-cards/grow-room-cards.js`
   - Type: JavaScript Module

## Quick Start

Add any card to your dashboard using the visual editor or YAML:

```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.grow_room_temperature
  humidity: sensor.grow_room_humidity
  co2: sensor.grow_room_co2
  vpd: sensor.grow_room_vpd
title: Grow Room Environment
```

## Documentation

See individual card documentation for detailed configuration options.

## License

MIT License
