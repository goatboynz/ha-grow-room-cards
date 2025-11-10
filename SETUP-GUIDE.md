# Setup Guide - Grow Room Cards

## Quick Start

### Option 1: HACS Installation (Recommended)

1. Open HACS in Home Assistant
2. Click on "Frontend"
3. Click the menu (⋮) and select "Custom repositories"
4. Add repository URL: `https://github.com/goatboynz/ha-grow-room-cards`
5. Category: `Lovelace`
6. Click "Add"
7. Find "Grow Room Cards" in the list and click "Install"
8. Restart Home Assistant

### Option 2: Manual Installation

1. Download the latest release from GitHub
2. Extract the files
3. Copy all `.js` files to `config/www/grow-room-cards/`
4. Add resource in Home Assistant:
   - Go to Settings → Dashboards → Resources
   - Click "Add Resource"
   - URL: `/local/grow-room-cards/grow-room-cards.js`
   - Resource type: `JavaScript Module`
5. Restart Home Assistant

## First Card Setup

### 1. Environment Monitor

Add to your dashboard:

```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.YOUR_TEMP_SENSOR
  humidity: sensor.YOUR_HUMIDITY_SENSOR
  co2: sensor.YOUR_CO2_SENSOR
  vpd: sensor.YOUR_VPD_SENSOR
title: My Grow Room
```

**Replace** `sensor.YOUR_*` with your actual sensor entity IDs.

### 2. Switch Control

```yaml
type: custom:grow-switch-card
switches:
  - entity: switch.YOUR_LIGHT
    name: Grow Light
    type: light
  - entity: switch.YOUR_FAN
    name: Exhaust Fan
    type: fan
```

### 3. VPD Chart

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.YOUR_TEMP_SENSOR
humidity_sensor: sensor.YOUR_HUMIDITY_SENSOR
leaf_temperature_offset: 2
```

## Finding Your Entity IDs

1. Go to Developer Tools → States in Home Assistant
2. Search for your sensors/switches
3. Copy the entity ID (e.g., `sensor.temperature_sensor`)

## Troubleshooting

### Cards not appearing

1. **Clear browser cache**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Check browser console**: F12 → Console tab, look for errors
3. **Verify resource**: Settings → Dashboards → Resources, ensure the resource is added

### "Custom element doesn't exist"

- The resource wasn't loaded properly
- Clear cache and hard refresh
- Check the resource URL is correct

### Entities showing as "unavailable"

- Verify entity IDs are correct
- Check entities exist in Developer Tools → States
- Ensure sensors are working and reporting data

### History graphs not loading

- Ensure recorder is enabled in Home Assistant
- Check entities have history: Developer Tools → History
- Verify API access is working

## Example Complete Dashboard

```yaml
title: Grow Room
views:
  - title: Main
    path: main
    cards:
      # Environment monitoring
      - type: custom:grow-environment-card
        entities:
          temperature: sensor.grow_temp
          humidity: sensor.grow_humidity
          co2: sensor.grow_co2
          vpd: sensor.grow_vpd
        title: Environment
        
      # VPD Chart
      - type: custom:grow-vpd-chart-card
        temperature_sensor: sensor.grow_temp
        humidity_sensor: sensor.grow_humidity
        title: VPD Analysis
        
      # Equipment control
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
            
      # Irrigation
      - type: custom:grow-irrigation-card
        title: Watering
        zones:
          - entity: switch.zone_1
            name: Main Bed
            vwc_sensor: sensor.zone_1_moisture
            ec_sensor: sensor.zone_1_ec
```

## Tips

1. **Start Simple**: Begin with just the environment card, then add others
2. **Test Each Card**: Add one card at a time to identify any issues
3. **Use Friendly Names**: Set friendly names in Home Assistant for better display
4. **Group Related Items**: Keep related cards together on your dashboard
5. **Mobile View**: Cards are responsive and work great on mobile devices

## Getting Help

- Check the [DOCUMENTATION.md](DOCUMENTATION.md) for detailed configuration
- Review the [README.md](README.md) for overview
- Open an issue on GitHub for bugs or feature requests

## Next Steps

Once you have the basic cards working:

1. Customize colors using Home Assistant themes
2. Add automation triggers based on card interactions
3. Create multiple views for different grow areas
4. Set up notifications for out-of-range values
5. Integrate with other Home Assistant features

Happy Growing! 🌱
