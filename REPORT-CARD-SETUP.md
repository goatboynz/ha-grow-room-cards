# Grow Report Card - Setup Guide

The Grow Report Card provides a comprehensive daily/weekly report based on the Athena Pro Line feeding schedule. It tracks your grow from day 1 through harvest with automatic scheduling and alerts.

## Features

- 📅 **Automatic Week Calculation** - Tracks days and weeks from start date
- 📊 **Athena Pro Line Schedule** - Week-by-week feeding targets
- 🎯 **Dynamic Targets** - Adjusts targets based on current week
- 🔔 **Event Scheduling** - Tracks deleaf, lollipop, and harvest dates
- ⚠️ **Smart Alerts** - Warns when parameters are out of range
- ✅ **Daily Checklist** - Handbook-based daily tasks
- 💡 **Troubleshooting Tips** - Built-in guidance

## Required Entities

### 1. Start Date (input_datetime)

Create an input datetime to track when you started flowering:

```yaml
# configuration.yaml
input_datetime:
  flower_room_1_start_date:
    name: Flower Room 1 Start Date
    has_date: true
    has_time: false
```

### 2. Sensors

You need these sensors for each room:

- **Temperature** - `sensor.room_temperature` (°C or °F)
- **Humidity** - `sensor.room_humidity` (%)
- **VPD** - `sensor.room_vpd` (kPa)
- **CO2** - `sensor.room_co2` (ppm)

### 3. Lights Switch

- **Lights** - `switch.room_lights` (on/off)

## Optional Entities

### Toggle Helpers

```yaml
# configuration.yaml
input_boolean:
  flower_room_1_co2_enabled:
    name: Flower Room 1 CO2 Enabled
    icon: mdi:molecule-co2
    
  flower_room_1_watering_enabled:
    name: Flower Room 1 Watering Enabled
    icon: mdi:water
```

### Light Leak Detection

```yaml
binary_sensor:
  - platform: template
    sensors:
      flower_room_1_light_leak:
        friendly_name: "Flower Room 1 Light Leak"
        value_template: >
          {{ states('sensor.room_light_level')|int > 10 and is_state('switch.room_lights', 'off') }}
```

### Irrigation Zones

- `switch.irrigation_zone_1`
- `switch.irrigation_zone_2`

## Creating VPD Sensor

If you don't have a VPD sensor, create one:

```yaml
# configuration.yaml
template:
  - sensor:
      - name: "Flower Room 1 VPD"
        unit_of_measurement: "kPa"
        state_class: measurement
        device_class: pressure
        state: >
          {% set t = states('sensor.flower_room_1_temperature') | float %}
          {% set rh = states('sensor.flower_room_1_humidity') | float %}
          {% set leaf_offset = 2 %}
          {% set t_leaf = t - leaf_offset %}
          {% set svp_leaf = 0.61078 * e ** (17.27 * t_leaf / (t_leaf + 237.3)) %}
          {% set svp_air = 0.61078 * e ** (17.27 * t / (t + 237.3)) %}
          {% set vpd = svp_leaf - (svp_air * rh / 100) %}
          {{ vpd | round(2) }}
```

## Basic Configuration

### Minimal Setup

```yaml
type: custom:grow-report-card
room_name: Flower Room 1
start_date_entity: input_datetime.flower_room_1_start_date
temperature_entity: sensor.flower_room_1_temperature
humidity_entity: sensor.flower_room_1_humidity
vpd_entity: sensor.flower_room_1_vpd
co2_entity: sensor.flower_room_1_co2
lights_entity: switch.flower_room_1_lights
```

### Full Configuration

```yaml
type: custom:grow-report-card
room_name: Flower Room 1
title: F1 Grow Report

# Required entities
start_date_entity: input_datetime.f1_start_date
temperature_entity: sensor.f1_temperature
humidity_entity: sensor.f1_humidity
vpd_entity: sensor.f1_vpd
co2_entity: sensor.f1_co2
lights_entity: switch.f1_lights

# Optional entities
co2_toggle_entity: input_boolean.f1_co2_enabled
watering_toggle_entity: input_boolean.f1_watering_enabled
light_leak_entity: binary_sensor.f1_light_leak
zone_1_entity: switch.irrigation_zone_1
zone_2_entity: switch.irrigation_zone_2

# Settings
light_hours: 12
feed_system: athena_pro
grow_medium: coco
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `room_name` | string | **Yes** | - | Room identifier |
| `title` | string | No | `{room_name} Grow Report` | Card title |
| `start_date_entity` | string | **Yes** | - | input_datetime for start date |
| `temperature_entity` | string | **Yes** | - | Temperature sensor |
| `humidity_entity` | string | **Yes** | - | Humidity sensor |
| `vpd_entity` | string | **Yes** | - | VPD sensor |
| `co2_entity` | string | **Yes** | - | CO2 sensor |
| `lights_entity` | string | **Yes** | - | Lights switch |
| `co2_toggle_entity` | string | No | - | CO2 enable/disable toggle |
| `watering_toggle_entity` | string | No | - | Watering enable/disable toggle |
| `light_leak_entity` | string | No | - | Light leak detection sensor |
| `zone_1_entity` | string | No | - | Irrigation zone 1 switch |
| `zone_2_entity` | string | No | - | Irrigation zone 2 switch |
| `light_hours` | number | No | `12` | Hours lights are on per day |
| `feed_system` | string | No | `athena_pro` | Feeding system (future use) |
| `grow_medium` | string | No | `coco` | Growing medium (future use) |

## Multiple Rooms

Create a separate card for each room:

```yaml
# Flower Room 1
type: custom:grow-report-card
room_name: Flower Room 1
start_date_entity: input_datetime.f1_start_date
temperature_entity: sensor.f1_temperature
humidity_entity: sensor.f1_humidity
vpd_entity: sensor.f1_vpd
co2_entity: sensor.f1_co2
lights_entity: switch.f1_lights

# Flower Room 2
type: custom:grow-report-card
room_name: Flower Room 2
start_date_entity: input_datetime.f2_start_date
temperature_entity: sensor.f2_temperature
humidity_entity: sensor.f2_humidity
vpd_entity: sensor.f2_vpd
co2_entity: sensor.f2_co2
lights_entity: switch.f2_lights
```

## Athena Pro Line Schedule

The card automatically adjusts targets based on the current week:

### Weeks 1-4: Generative Steering
- **Temperature**: 24-28°C
- **Humidity**: 60-72%
- **VPD**: 1.0-1.2 kPa
- **Feed EC**: 3.0
- **Dryback**: 50-60%
- **Runoff**: 1-7%

### Weeks 5-7: Vegetative Steering (Bulk)
- **Temperature**: 24-28°C
- **Humidity**: 60-72%
- **VPD**: 1.0-1.2 kPa
- **Feed EC**: 3.0
- **Dryback**: 30-40%
- **Runoff**: 8-16%

### Week 8: Finish (Fade)
- **Temperature**: 18-22°C
- **Humidity**: 50-60%
- **VPD**: 1.0-1.2 kPa
- **Feed EC**: 3.0
- **Dryback**: 30-40%
- **Runoff**: 8-16%

### Week 9+: Flush
- **Temperature**: 18-22°C
- **Humidity**: 50-60%
- **VPD**: 1.0-1.2 kPa
- **Feed EC**: 0.0 (Target <0.1 EC)
- **Dryback**: 30-40%
- **Runoff**: N/A (Flush)

## Event Schedule

The card automatically tracks these events:

| Event | Day | Description |
|-------|-----|-------------|
| Deleaf 1 | 1 | Initial defoliation |
| Lollipop | 21 | Remove lower growth |
| Deleaf (Main) | 21 | Major defoliation (same day as lollipop) |
| Deleaf (Mid) | 35 | Mid-flower defoliation |
| Deleaf (Final) | 49 | Final defoliation (7 days before harvest) |
| Harvest | 56-60 | Harvest window |

## Alerts

The card will alert you when:

- Temperature is out of range
- Humidity is out of range
- VPD is out of range
- CO2 is low (when enabled and lights on)
- Watering is disabled
- Light leak is detected

## Daily Checklist

Based on Athena Handbook p. 31:

- ✅ Record Temp & Humidity
- ✅ Check Runoff EC & pH
- ✅ Confirm Feed Tank pH & EC
- ✅ Inspect for Pests or Mildew
- ✅ Check Moisture for Dryback
- ✅ Inspect for Light Leaks

## Troubleshooting Tips

Built-in guidance from the Athena Handbook:

### Runoff EC Management
- **High Runoff EC**: Water with additional nutrient solution at target Feed EC
- **Low Runoff EC**: Increase Feed EC by 0.5-1.0, push less runoff

### Watering Technique
- Water at center first for instant hydration
- Then water edges to encourage root expansion
- Water slowly (60+ seconds) to prevent channeling

## Complete Example Dashboard

```yaml
title: Grow Rooms
views:
  - title: Flower Room 1
    path: f1
    cards:
      # Report Card
      - type: custom:grow-report-card
        room_name: Flower Room 1
        start_date_entity: input_datetime.f1_start_date
        temperature_entity: sensor.f1_temperature
        humidity_entity: sensor.f1_humidity
        vpd_entity: sensor.f1_vpd
        co2_entity: sensor.f1_co2
        lights_entity: switch.f1_lights
        co2_toggle_entity: input_boolean.f1_co2_enabled
        watering_toggle_entity: input_boolean.f1_watering_enabled
        zone_1_entity: switch.f1_zone_1
        zone_2_entity: switch.f1_zone_2
        
      # Environment Monitor
      - type: custom:grow-environment-card
        entities:
          temperature: sensor.f1_temperature
          humidity: sensor.f1_humidity
          co2: sensor.f1_co2
          vpd: sensor.f1_vpd
        title: F1 Environment
        
      # VPD Chart
      - type: custom:grow-vpd-chart-card
        temperature_sensor: sensor.f1_temperature
        humidity_sensor: sensor.f1_humidity
        title: F1 VPD Chart
```

## Tips

1. **Set Start Date Correctly** - This is critical for accurate scheduling
2. **Check Daily** - Review the report card daily for alerts
3. **Follow the Schedule** - The Athena Pro Line schedule is proven
4. **Monitor Runoff** - EC and pH of runoff are key indicators
5. **Adjust as Needed** - Every strain is different, adjust targets if needed

## References

- Athena Pro Line Feed Schedule
- Athena Homegrower Handbook
- Based on proven commercial growing practices

---

**Ready to track your grow professionally!** 🌱
