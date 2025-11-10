# VPD Chart Card

Interactive Vapor Pressure Deficit (VPD) chart with color-coded zones for optimal plant growth.

![VPD Chart Card](https://img.shields.io/badge/Type-grow--vpd--chart--card-green)

## Features

- 📊 Interactive VPD chart with color-coded zones
- 🎯 Real-time current conditions marker
- 🖱️ Crosshair follows mouse cursor
- 🔍 Zoom in/out with mouse wheel
- 👆 Pan when zoomed (click and drag)
- 💡 Hover tooltip shows VPD at any point
- 🌡️ Displays both Leaf VPD and Room VPD
- 🎨 Color zones based on growth stage
- 📱 Touch-friendly on mobile

## Basic Configuration

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.grow_room_temperature
humidity_sensor: sensor.grow_room_humidity
```

## Full Configuration

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.grow_room_temperature    # Required
humidity_sensor: sensor.grow_room_humidity          # Required
leaf_temperature_sensor: sensor.leaf_temperature    # Optional
leaf_temperature_offset: 2                          # Optional, default: 2
title: VPD Analysis                                 # Optional, default: "VPD Chart"
min_temperature: 15                                 # Optional, default: 15
max_temperature: 35                                 # Optional, default: 35
min_humidity: 30                                    # Optional, default: 30
max_humidity: 90                                    # Optional, default: 90
growth_stage: vegetative                            # Optional, default: "vegetative"
enable_crosshair: true                              # Optional, default: true
enable_zoom: true                                   # Optional, default: true
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be `custom:grow-vpd-chart-card` |
| `temperature_sensor` | string | **Yes** | - | Air temperature sensor entity ID |
| `humidity_sensor` | string | **Yes** | - | Humidity sensor entity ID |
| `leaf_temperature_sensor` | string | No | - | Leaf temperature sensor (if available) |
| `leaf_temperature_offset` | number | No | `2` | Degrees cooler than air temp |
| `title` | string | No | `"VPD Chart"` | Card title |
| `min_temperature` | number | No | `15` | Minimum temperature on chart (°C) |
| `max_temperature` | number | No | `35` | Maximum temperature on chart (°C) |
| `min_humidity` | number | No | `30` | Minimum humidity on chart (%) |
| `max_humidity` | number | No | `90` | Maximum humidity on chart (%) |
| `growth_stage` | string | No | `"vegetative"` | Growth stage for optimal zones |
| `enable_crosshair` | boolean | No | `true` | Show crosshair on hover |
| `enable_zoom` | boolean | No | `true` | Enable zoom functionality |

## Growth Stages

| Stage | Optimal VPD Range | Description |
|-------|-------------------|-------------|
| `seedling` | 0.4 - 0.8 kPa | Young plants, gentle transpiration |
| `vegetative` | 0.8 - 1.2 kPa | Active growth phase |
| `flowering` | 1.0 - 1.5 kPa | Flower development |
| `late_flower` | 1.2 - 1.6 kPa | Final ripening stage |

## VPD Color Zones

The chart displays color-coded zones:

| Color | VPD Range | Meaning |
|-------|-----------|---------|
| 🔵 Gray | < 0 kPa | Too low (impossible) |
| 🔵 Blue | 0 - 0.4 kPa | Under-transpiration |
| 🟢 Teal | 0.4 - 0.8 kPa | Early vegetative |
| 🟢 Green | 0.8 - 1.2 kPa | Late vegetative |
| 🟡 Yellow | 1.2 - 1.6 kPa | Mid-late flowering |
| 🔴 Red | > 1.6 kPa | Too high (stress) |

## Understanding VPD

### What is VPD?

Vapor Pressure Deficit (VPD) is the difference between the amount of moisture in the air and how much moisture the air can hold when saturated. It's a key indicator for plant transpiration and growth.

### Leaf VPD vs Room VPD

- **Leaf VPD**: Uses leaf temperature (typically 2°C cooler than air)
- **Room VPD**: Uses air temperature

**Leaf VPD is more accurate** for plant health as it represents the actual transpiration pressure at the leaf surface.

### Formula

```
VPD = SVP(leaf) - AVP(air)

Where:
- SVP(leaf) = Saturation Vapor Pressure at leaf temperature
- AVP(air) = Actual Vapor Pressure in the air
```

## Interactive Features

### Crosshair

Move your mouse over the chart to see:
- Current air temperature at that point
- Corresponding leaf temperature
- Relative humidity
- Calculated VPD value

### Zoom

- **Zoom In**: Scroll mouse wheel up
- **Zoom Out**: Scroll mouse wheel down
- **Reset Zoom**: Click middle mouse button
- **Zoom Range**: 1x to 3x

### Pan

When zoomed in:
1. Click and hold on the chart
2. Drag to pan around
3. Release to stop panning

## Examples

### Basic Setup

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.temperature
humidity_sensor: sensor.humidity
```

### With Leaf Temperature Sensor

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.air_temperature
humidity_sensor: sensor.humidity
leaf_temperature_sensor: sensor.leaf_temperature
title: VPD Analysis
```

### Custom Temperature Offset

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.grow_temp
humidity_sensor: sensor.grow_humidity
leaf_temperature_offset: 3
title: VPD Chart
```

### Flowering Stage

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.flower_room_temp
humidity_sensor: sensor.flower_room_humidity
growth_stage: flowering
title: Flower Room VPD
```

### Custom Range

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.temperature
humidity_sensor: sensor.humidity
min_temperature: 18
max_temperature: 30
min_humidity: 40
max_humidity: 80
```

### Minimal UI (No Crosshair/Zoom)

```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.temperature
humidity_sensor: sensor.humidity
enable_crosshair: false
enable_zoom: false
```

## Optimal VPD Targets

### By Growth Stage

| Stage | Target VPD | Temperature | Humidity |
|-------|------------|-------------|----------|
| Seedling | 0.4-0.8 kPa | 20-25°C | 65-75% |
| Early Veg | 0.8-1.0 kPa | 22-26°C | 60-70% |
| Late Veg | 1.0-1.2 kPa | 24-28°C | 55-65% |
| Early Flower | 1.0-1.3 kPa | 24-28°C | 50-60% |
| Late Flower | 1.2-1.6 kPa | 24-28°C | 45-55% |

### Adjusting VPD

**To Increase VPD** (if too low):
- Increase temperature
- Decrease humidity
- Improve air circulation

**To Decrease VPD** (if too high):
- Decrease temperature
- Increase humidity
- Reduce air movement

## Troubleshooting

### Chart shows wrong values

**Solution**:
1. Verify temperature sensor is in °C (or °F is converted)
2. Check humidity sensor is in %
3. Ensure sensors are accurate and calibrated

### Current point not showing

**Solution**:
1. Check both sensors are available
2. Verify values are within chart range
3. Adjust min/max temperature and humidity if needed

### Crosshair not working

**Solution**:
1. Ensure `enable_crosshair: true`
2. Try refreshing the page
3. Check browser console for errors

### Zoom not working

**Solution**:
1. Ensure `enable_zoom: true`
2. Try using mouse wheel instead of trackpad
3. Check browser supports wheel events

### Colors don't match growth stage

**Solution**:
1. Set `growth_stage` parameter correctly
2. Colors are fixed per VPD range, not customizable
3. Use appropriate growth stage for your plants

## Creating a Leaf Temperature Sensor

If you don't have an infrared sensor, use the offset method:

```yaml
# configuration.yaml
template:
  - sensor:
      - name: "Leaf Temperature"
        unit_of_measurement: "°C"
        state: >
          {{ states('sensor.air_temperature') | float - 2 }}
```

Or use the card's built-in offset (recommended).

## Best Practices

1. **Use actual leaf temperature** if you have an IR sensor
2. **Adjust offset** based on your environment (typically 2-4°C)
3. **Match growth stage** to your plants' current phase
4. **Monitor trends** - VPD should be stable, not fluctuating
5. **Set appropriate ranges** - Adjust min/max to focus on your operating range
6. **Check regularly** - VPD is as important as temperature and humidity

## Related Cards

- [Environment Monitor Card](Environment-Monitor-Card) - View current VPD value
- [Switch Control Card](Switch-Control-Card) - Control equipment to adjust VPD

## See Also

- [Understanding VPD](https://www.cannabissciencetech.com/view/understanding-vpd-and-transpiration-rates-cannabis-cultivation-operations)
- [Configuration Options](Configuration-Options)
- [Troubleshooting](Troubleshooting)
