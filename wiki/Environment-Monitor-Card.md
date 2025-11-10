# Environment Monitor Card

The Environment Monitor Card displays key environmental parameters with clickable history graphs.

![Environment Card](https://img.shields.io/badge/Type-grow--environment--card-blue)

## Features

- 🌡️ Temperature monitoring
- 💧 Humidity monitoring
- 🌱 CO2 monitoring (optional)
- 📊 VPD monitoring (optional)
- 📈 Click any metric to view 24-hour history graph
- 🎨 Color-coded metric cards
- ⚡ Real-time updates
- 📱 Mobile-friendly

## Basic Configuration

```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.grow_room_temperature
  humidity: sensor.grow_room_humidity
title: Environment
```

## Full Configuration

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

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be `custom:grow-environment-card` |
| `entities` | object | **Yes** | - | Entity configuration (see below) |
| `title` | string | No | `"Environment"` | Card title |
| `history_hours` | number | No | `24` | Hours of history to display in graphs |

### Entities Object

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `temperature` | string | **Yes** | Temperature sensor entity ID |
| `humidity` | string | **Yes** | Humidity sensor entity ID |
| `co2` | string | No | CO2 sensor entity ID |
| `vpd` | string | No | VPD sensor entity ID |

## Entity Requirements

### Temperature Sensor
- **Domain**: `sensor.*`
- **Unit**: °C or °F
- **Example**: `sensor.grow_room_temperature`

### Humidity Sensor
- **Domain**: `sensor.*`
- **Unit**: %
- **Example**: `sensor.grow_room_humidity`

### CO2 Sensor (Optional)
- **Domain**: `sensor.*`
- **Unit**: ppm
- **Example**: `sensor.grow_room_co2`

### VPD Sensor (Optional)
- **Domain**: `sensor.*`
- **Unit**: kPa
- **Example**: `sensor.grow_room_vpd`

## Usage

### Viewing History

1. Click on any metric card (temperature, humidity, CO2, or VPD)
2. A history graph will appear showing the last 24 hours (or configured hours)
3. Click the **Back** button to return to the main view

### Color Coding

Each metric has a distinct color:
- 🔴 **Temperature**: Red gradient
- 🔵 **Humidity**: Blue/teal gradient
- 🟢 **CO2**: Green gradient
- 🟡 **VPD**: Yellow gradient

## Examples

### Minimal Setup (Temperature & Humidity Only)

```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.temperature
  humidity: sensor.humidity
```

### With CO2 Monitoring

```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.grow_temp
  humidity: sensor.grow_humidity
  co2: sensor.grow_co2
title: Grow Room
```

### Complete Setup with VPD

```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.grow_room_temperature
  humidity: sensor.grow_room_humidity
  co2: sensor.grow_room_co2
  vpd: sensor.grow_room_vpd
title: Main Grow Room
history_hours: 48
```

### Multiple Rooms

```yaml
# Room 1
type: custom:grow-environment-card
entities:
  temperature: sensor.room1_temperature
  humidity: sensor.room1_humidity
  co2: sensor.room1_co2
title: Veg Room

# Room 2
type: custom:grow-environment-card
entities:
  temperature: sensor.room2_temperature
  humidity: sensor.room2_humidity
  co2: sensor.room2_co2
title: Flower Room
```

## Calculating VPD

If you don't have a VPD sensor, you can create one using a template sensor:

```yaml
# configuration.yaml
template:
  - sensor:
      - name: "Grow Room VPD"
        unit_of_measurement: "kPa"
        state: >
          {% set t = states('sensor.grow_room_temperature') | float %}
          {% set rh = states('sensor.grow_room_humidity') | float %}
          {% set leaf_offset = 2 %}
          {% set t_leaf = t - leaf_offset %}
          {% set svp_leaf = 0.61078 * e ** (17.27 * t_leaf / (t_leaf + 237.3)) %}
          {% set svp_air = 0.61078 * e ** (17.27 * t / (t + 237.3)) %}
          {% set vpd = svp_leaf - (svp_air * rh / 100) %}
          {{ vpd | round(2) }}
```

## Troubleshooting

### Metric shows "--"

**Cause**: Entity is unavailable or doesn't exist

**Solution**:
1. Check entity ID is correct
2. Verify entity exists in Developer Tools → States
3. Ensure sensor is working and reporting data

### History graph is empty

**Cause**: No history data available

**Solution**:
1. Ensure recorder is enabled in Home Assistant
2. Check entity has history in Developer Tools → History
3. Wait for data to accumulate (may take time for new sensors)
4. Verify `history_hours` setting

### History graph shows "No data"

**Cause**: Entity doesn't have enough history

**Solution**:
1. Reduce `history_hours` to a shorter period
2. Wait for more data to accumulate
3. Check recorder configuration

### Card not updating

**Cause**: State changes not being detected

**Solution**:
1. Check sensor is updating in Developer Tools → States
2. Verify entity IDs are correct
3. Refresh browser
4. Check Home Assistant logs for errors

## Styling

The card uses Home Assistant theme variables:

- `--card-background-color` - Card background
- `--primary-text-color` - Text color
- `--divider-color` - Border color

Colors are fixed per metric type for consistency.

## Best Practices

1. **Use descriptive titles** - Especially if you have multiple rooms
2. **Include VPD** - Essential for optimal plant growth
3. **Monitor CO2** - Important for sealed rooms
4. **Check history regularly** - Identify trends and issues
5. **Set appropriate history_hours** - Balance detail vs. performance

## Related Cards

- [VPD Chart Card](VPD-Chart-Card) - Detailed VPD analysis
- [Switch Control Card](Switch-Control-Card) - Control equipment based on readings

## See Also

- [Configuration Options](Configuration-Options)
- [Entity Requirements](Entity-Requirements)
- [Troubleshooting](Troubleshooting)
