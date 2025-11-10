# Grow Room Overview Card

A comprehensive dashboard card that provides a complete at-a-glance view of your grow room status, including environmental metrics, grow stage, watering events, and system alerts.

## Features

- **Room Header**: Room name with icon, stage, day/week counter, start date, and lights status
- **Environmental Metrics**: Temperature, Humidity, Room VPD, Leaf VPD, CO2 with sparkline graphs
- **Last Watering Event**: Shows time since last watering
- **System Alerts**: Real-time alert monitoring with visual indicators
- **Dark Theme**: Professional dark gradient background matching the reference design
- **Sparkline Graphs**: Mini 24-hour trend graphs for each metric (optional)

## Installation

1. Copy `grow-room-overview-card.js` to your `www` folder
2. Add the resource in your Lovelace configuration:

```yaml
resources:
  - url: /local/grow-room-overview-card.js
    type: module
```

## Configuration

### Basic Configuration

```yaml
type: custom:grow-room-overview-card
room_name: F2 Flowering Room
start_date_entity: input_datetime.f2_flower_start
lights_entity: light.f2_grow_lights
temperature_entity: sensor.f2_temperature
humidity_entity: sensor.f2_humidity
vpd_entity: sensor.f2_vpd
co2_entity: sensor.f2_co2
```

### Full Configuration

```yaml
type: custom:grow-room-overview-card
title: F2 Flowering Room
room_name: F2 Flowering Room

# Required Entities
start_date_entity: input_datetime.f2_flower_start
lights_entity: light.f2_grow_lights
temperature_entity: sensor.f2_temperature
humidity_entity: sensor.f2_humidity
vpd_entity: sensor.f2_vpd
co2_entity: sensor.f2_co2

# Optional Entities
stage_entity: input_select.f2_grow_stage
leaf_vpd_entity: sensor.f2_leaf_vpd
last_watering_entity: sensor.f2_last_watering
alert_entities:
  - binary_sensor.f2_high_temp_alert
  - binary_sensor.f2_low_humidity_alert
  - binary_sensor.f2_vpd_alert

# Settings
show_sparklines: true
light_hours: 12
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `room_name` | string | Yes | - | Name of the grow room |
| `title` | string | No | room_name | Card title (defaults to room_name) |
| `start_date_entity` | string | Yes | - | Entity tracking grow start date |
| `lights_entity` | string | Yes | - | Light switch/entity |
| `temperature_entity` | string | Yes | - | Temperature sensor |
| `humidity_entity` | string | Yes | - | Humidity sensor |
| `vpd_entity` | string | Yes | - | VPD sensor |
| `co2_entity` | string | Yes | - | CO2 sensor |
| `stage_entity` | string | No | - | Current grow stage (Flowering, Veg, etc.) |
| `leaf_vpd_entity` | string | No | - | Leaf VPD sensor |
| `last_watering_entity` | string | No | - | Last watering timestamp entity |
| `alert_entities` | list | No | [] | List of alert/warning entities to monitor |
| `show_sparklines` | boolean | No | true | Show 24-hour trend sparklines |
| `light_hours` | number | No | 12 | Hours of light per day |

## Entity Setup Examples

### Start Date Entity
```yaml
input_datetime:
  f2_flower_start:
    name: F2 Flower Start Date
    has_date: true
    has_time: false
```

### Stage Entity
```yaml
input_select:
  f2_grow_stage:
    name: F2 Grow Stage
    options:
      - Seedling
      - Vegetative
      - Flowering
      - Harvest
    initial: Flowering
```

### Last Watering Sensor
```yaml
sensor:
  - platform: template
    sensors:
      f2_last_watering:
        friendly_name: "F2 Last Watering"
        value_template: >
          {% set last = states.switch.f2_irrigation_zone_1.last_changed %}
          {{ (now() - last).total_seconds() / 3600 | round(0) }}
        unit_of_measurement: "hours"
```

## Visual Design

The card features:
- **Dark gradient background** (matching the reference image)
- **Color-coded metrics**:
  - 🌡️ Temperature: Green (#4CAF50)
  - 💧 Humidity: Blue (#2196F3)
  - 🌿 Room VPD: Purple (#9C27B0)
  - 🍃 Leaf VPD: Light Green (#8BC34A)
  - 💨 CO2: Cyan (#00BCD4)
- **Sparkline graphs**: 24-hour trend visualization
- **Status indicators**: Lights ON/OFF with icons
- **Alert badges**: Color-coded (green=nominal, orange=warning, red=critical)

## Sections

### 1. Header Section
- Room name with flower icon
- Current stage (Flowering, Veg, etc.)
- Day count and week number
- Start date
- Lights status (ON/OFF with icon)

### 2. Last Watering Event
- Shows hours since last watering
- Blue water drop icon
- Only displays if `last_watering_entity` is configured

### 3. System Alerts
- Shows "All Systems Nominal" when no alerts
- Lists active alerts with severity indicators
- Color-coded: Green (nominal), Orange (warning), Red (critical)
- Pulsing animation for critical alerts

### 4. Environmental Metrics
- Day counter with sun icon
- Temperature with sparkline
- Humidity with sparkline
- Room VPD with sparkline
- Leaf VPD with sparkline (if configured)
- CO2 with sparkline

## Sparkline Graphs

The sparkline graphs show the last 24 hours of data for each metric:
- Green line with semi-transparent fill
- Automatically scales to data range
- Updates when card refreshes
- Can be disabled with `show_sparklines: false`

## Use Cases

### Single Room Dashboard
Perfect for a dedicated dashboard showing one room's complete status.

### Multi-Room Overview
Use multiple cards in a grid layout to monitor several rooms:

```yaml
type: grid
columns: 2
cards:
  - type: custom:grow-room-overview-card
    room_name: F2 Flowering Room
    # ... config ...
  
  - type: custom:grow-room-overview-card
    room_name: Veg Room
    # ... config ...
  
  - type: custom:grow-room-overview-card
    room_name: Mother Room
    # ... config ...
```

### Mobile Dashboard
The card is responsive and works great on mobile devices with its vertical layout.

## Tips

1. **Use consistent naming**: Name your entities with room prefixes (e.g., `f2_`, `veg_`, `mother_`)
2. **Set up alerts**: Configure binary sensors for high/low thresholds
3. **Track watering**: Use automation timestamps or switch last_changed
4. **Update start date**: Change the start_date_entity when flipping to flower
5. **Monitor trends**: The sparklines help spot gradual changes

## Troubleshooting

**Sparklines not showing:**
- Ensure entities have at least 24 hours of history
- Check that recorder is enabled for these entities
- Try setting `show_sparklines: false` if history is unavailable

**"Loading..." stuck:**
- Verify all required entities exist
- Check entity IDs are correct
- Ensure entities are not unavailable

**Alerts not showing:**
- Verify alert_entities are binary sensors or have on/off states
- Check entity states in Developer Tools

## Example Complete Setup

```yaml
# Lovelace Card
type: custom:grow-room-overview-card
title: F2 Flowering Room
room_name: F2 Flowering Room
start_date_entity: input_datetime.f2_flower_start
stage_entity: input_select.f2_grow_stage
lights_entity: light.f2_grow_lights
temperature_entity: sensor.f2_temperature
humidity_entity: sensor.f2_humidity
vpd_entity: sensor.f2_vpd
leaf_vpd_entity: sensor.f2_leaf_vpd
co2_entity: sensor.f2_co2
last_watering_entity: sensor.f2_hours_since_watering
alert_entities:
  - binary_sensor.f2_high_temp
  - binary_sensor.f2_low_humidity
  - binary_sensor.f2_vpd_out_of_range
show_sparklines: true
light_hours: 12
```

## Screenshots

The card displays:
- Clean, professional dark theme
- All metrics at a glance
- Visual trend indicators
- Clear status information
- Responsive layout

---

**Card Size**: 6 (tall card, suitable for main dashboard)
**Browser Support**: Modern browsers with Canvas API support
**Mobile**: Fully responsive
