# Grow Room Cards

A complete suite of custom cards designed specifically for grow room monitoring and control in Home Assistant.

## Features

- **Environment Monitor** - Track temperature, humidity, CO2, and VPD with interactive history graphs
- **Switch Control** - Stylish control panel for all your grow room equipment
- **Irrigation Control** - Manage watering zones with VWC and EC monitoring
- **VPD Chart** - Interactive VPD chart with color-coded zones (separate card)
- **Spectrum Sensor** - AS7341 spectral analysis visualization (separate card)

All cards share a unified, modern design language for a cohesive dashboard experience.

## Quick Configuration

### Environment Monitor
```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.grow_room_temperature
  humidity: sensor.grow_room_humidity
  co2: sensor.grow_room_co2
  vpd: sensor.grow_room_vpd
```

### Switch Control
```yaml
type: custom:grow-switch-card
switches:
  - entity: switch.grow_light
    name: Grow Light
    type: light
  - entity: switch.exhaust_fan
    name: Exhaust Fan
    type: fan
```

### Irrigation Control
```yaml
type: custom:grow-irrigation-card
zones:
  - entity: switch.irrigation_zone_1
    name: Zone 1
    vwc_sensor: sensor.zone_1_vwc
    ec_sensor: sensor.zone_1_ec
```
