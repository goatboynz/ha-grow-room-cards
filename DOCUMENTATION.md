# Grow Room Cards - Complete Documentation

## Overview

A comprehensive suite of custom cards for Home Assistant designed specifically for grow room monitoring and control. All cards share a unified, modern design language.

## Cards Included

### 1. Environment Monitor Card (`grow-environment-card`)

Monitor key environmental parameters with clickable history graphs.

**Features:**
- Temperature, Humidity, CO2, and VPD monitoring
- Click any metric to view 24-hour history graph
- Color-coded metric cards
- Smooth animations and transitions

**Configuration:**
```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.grow_room_temperature  # Required
  humidity: sensor.grow_room_humidity        # Required
  co2: sensor.grow_room_co2                  # Optional
  vpd: sensor.grow_room_vpd                  # Optional
title: Grow Room Environment                # Optional, default: "Environment"
history_hours: 24                            # Optional, default: 24
```

**Icons:**
- Temperature: 🌡️
- Humidity: 💧
- CO2: 🌱
- VPD: 📊

---

### 2. Switch Control Card (`grow-switch-card`)

Stylish control panel for all your grow room equipment.

**Features:**
- Grid layout with automatic sizing
- Visual feedback (on/off states)
- Custom icons per device type
- Hover effects and animations
- Unavailable state handling

**Configuration:**
```yaml
type: custom:grow-switch-card
title: Equipment Control                    # Optional, default: "Equipment Control"
switches:
  - entity: switch.grow_light
    name: Grow Light                        # Optional, uses friendly_name if not set
    type: light                             # Optional, determines icon
  - entity: switch.exhaust_fan
    name: Exhaust Fan
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
  - entity: switch.cooler
    name: Cooler
    type: cooler
  - entity: switch.irrigation_pump
    name: Pump
    type: pump
  - entity: switch.water_valve
    name: Valve
    type: valve
```

**Available Types & Icons:**
- `light`: 💡
- `fan`: 🌀
- `humidifier`: 💨
- `dehumidifier`: 🌬️
- `heater`: 🔥
- `cooler`: ❄️
- `pump`: ⚡
- `valve`: 🚰
- `default`: 🔌

---

### 3. Irrigation Control Card (`grow-irrigation-card`)

Manage irrigation zones with VWC (Volumetric Water Content) and EC (Electrical Conductivity) monitoring.

**Features:**
- Multiple zone support
- Start/Stop controls per zone
- Real-time VWC and EC display
- Historical graphs for VWC and EC
- Active zone highlighting

**Configuration:**
```yaml
type: custom:grow-irrigation-card
title: Irrigation Control                   # Optional, default: "Irrigation Control"
history_hours: 24                           # Optional, default: 24
zones:
  - entity: switch.irrigation_zone_1        # Required - zone control switch
    name: Zone 1 - Vegetables               # Optional
    vwc_sensor: sensor.zone_1_vwc          # Optional - water content sensor
    ec_sensor: sensor.zone_1_ec            # Optional - EC sensor
  - entity: switch.irrigation_zone_2
    name: Zone 2 - Herbs
    vwc_sensor: sensor.zone_2_vwc
    ec_sensor: sensor.zone_2_ec
```

**Sensor Units:**
- VWC: % (percentage)
- EC: mS/cm (milliSiemens per centimeter)

---

### 4. VPD Chart Card (`grow-vpd-chart-card`)

Interactive Vapor Pressure Deficit chart with color-coded zones.

**Features:**
- Real-time VPD calculation
- Color-coded zones for different growth stages
- Interactive crosshair
- Zoom support (mouse wheel)
- Pan support (click and drag when zoomed)
- Hover tooltip with detailed information
- Leaf and Room VPD display

**Configuration:**
```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.grow_room_temperature    # Required
humidity_sensor: sensor.grow_room_humidity          # Required
leaf_temperature_sensor: sensor.leaf_temperature    # Optional
leaf_temperature_offset: 2                          # Optional, default: 2
title: VPD Chart                                    # Optional
min_temperature: 15                                 # Optional, default: 15
max_temperature: 35                                 # Optional, default: 35
min_humidity: 30                                    # Optional, default: 30
max_humidity: 90                                    # Optional, default: 90
growth_stage: vegetative                            # Optional
enable_crosshair: true                              # Optional, default: true
enable_zoom: true                                   # Optional, default: true
```

**Growth Stages:**
- `seedling`
- `vegetative`
- `flowering`
- `late_flower`

**VPD Zones:**
- Gray: Too Low (< 0 kPa)
- Blue: Under Transpiration (0-0.4 kPa)
- Teal: Early Veg (0.4-0.8 kPa)
- Green: Late Veg (0.8-1.2 kPa)
- Yellow: Mid-Late Flower (1.2-1.6 kPa)
- Red: Too High (> 1.6 kPa)

---

### 5. Spectrum Sensor Card (`grow-spectrum-card`)

Visualize AS7341 spectral sensor data with interactive charts.

**Features:**
- 10-channel spectral display
- Rainbow gradient visualization
- Smooth interpolation
- Hover tooltips with wavelength info
- NIR (Near Infrared) channel support

**Configuration:**
```yaml
type: custom:grow-spectrum-card
entity: sensor.as7341_spectrum                      # Required
title: Light Spectrum Analysis                      # Optional
show_wavelengths: true                              # Optional, default: true
```

**Channels:**
- 415nm (Violet)
- 445nm (Blue)
- 480nm (Cyan)
- 515nm (Green)
- 555nm (Yellow-Green)
- 590nm (Yellow)
- 630nm (Orange)
- 680nm (Red)
- Clear
- NIR (Near Infrared)

---

## Complete Dashboard Example

```yaml
title: Grow Room
views:
  - title: Overview
    cards:
      - type: custom:grow-environment-card
        entities:
          temperature: sensor.grow_room_temperature
          humidity: sensor.grow_room_humidity
          co2: sensor.grow_room_co2
          vpd: sensor.grow_room_vpd
        title: Environment
        
      - type: custom:grow-vpd-chart-card
        temperature_sensor: sensor.grow_room_temperature
        humidity_sensor: sensor.grow_room_humidity
        leaf_temperature_offset: 2
        title: VPD Chart
        
      - type: custom:grow-switch-card
        title: Equipment
        switches:
          - entity: switch.grow_light
            name: Main Light
            type: light
          - entity: switch.exhaust_fan
            name: Exhaust
            type: fan
          - entity: switch.circulation_fan
            name: Circulation
            type: fan
          - entity: switch.humidifier
            type: humidifier
          - entity: switch.dehumidifier
            type: dehumidifier
            
      - type: custom:grow-irrigation-card
        title: Irrigation
        zones:
          - entity: switch.irrigation_zone_1
            name: Main Bed
            vwc_sensor: sensor.zone_1_vwc
            ec_sensor: sensor.zone_1_ec
          - entity: switch.irrigation_zone_2
            name: Side Bed
            vwc_sensor: sensor.zone_2_vwc
            ec_sensor: sensor.zone_2_ec
            
      - type: custom:grow-spectrum-card
        entity: sensor.as7341_spectrum
        title: Light Spectrum
```

## Styling

All cards use Home Assistant's theme variables for consistent styling:

- `--card-background-color`
- `--primary-color`
- `--accent-color`
- `--primary-text-color`
- `--secondary-text-color`
- `--divider-color`
- `--secondary-background-color`

Cards will automatically adapt to your Home Assistant theme (light/dark mode).

## Tips & Best Practices

1. **Environment Card**: Place this at the top of your dashboard for quick overview
2. **VPD Chart**: Position near environment card for easy correlation
3. **Switch Card**: Group related equipment together using the type parameter
4. **Irrigation Card**: Monitor VWC trends to optimize watering schedules
5. **Spectrum Card**: Use to verify light quality and intensity

## Troubleshooting

**Cards not showing:**
- Clear browser cache
- Check browser console for errors
- Verify entity IDs are correct

**History graphs not loading:**
- Ensure entities have history enabled in Home Assistant
- Check recorder configuration
- Verify API access

**Switches not responding:**
- Verify entity domains (must be `switch.*`)
- Check entity availability
- Ensure proper permissions

## Support

For issues, feature requests, or contributions, visit the GitHub repository.

## License

MIT License - See LICENSE file for details
