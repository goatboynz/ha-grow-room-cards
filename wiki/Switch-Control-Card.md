# Switch Control Card

Stylish control panel for all your grow room equipment with visual feedback and custom icons.

![Switch Control Card](https://img.shields.io/badge/Type-grow--switch--card-orange)

## Features

- 🔌 Control multiple devices from one card
- 🎨 Visual ON/OFF states with color coding
- 🖼️ Custom icons for different device types
- ⚡ One-click toggle
- 🎯 Hover effects and animations
- 📱 Touch-friendly on mobile
- 🔄 Real-time state updates
- ⚠️ Handles unavailable devices gracefully

## Basic Configuration

```yaml
type: custom:grow-switch-card
switches:
  - entity: switch.grow_light
    type: light
```

## Full Configuration

```yaml
type: custom:grow-switch-card
title: Equipment Control                    # Optional, default: "Equipment Control"
switches:
  - entity: switch.grow_light              # Required
    name: Main Grow Light                  # Optional, uses friendly_name if not set
    type: light                            # Optional, determines icon
  - entity: switch.exhaust_fan
    name: Exhaust Fan
    type: fan
  - entity: switch.humidifier
    name: Humidifier
    type: humidifier
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be `custom:grow-switch-card` |
| `title` | string | No | `"Equipment Control"` | Card title |
| `switches` | list | **Yes** | - | List of switch configurations |

### Switch Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `entity` | string | **Yes** | - | Switch entity ID |
| `name` | string | No | friendly_name | Display name |
| `type` | string | No | `default` | Device type (determines icon) |

## Device Types & Icons

| Type | Icon | Use For |
|------|------|---------|
| `light` | 💡 | Grow lights, LED panels |
| `fan` | 🌀 | Exhaust fans, circulation fans |
| `humidifier` | 💨 | Humidifiers, misters |
| `dehumidifier` | 🌬️ | Dehumidifiers |
| `heater` | 🔥 | Heaters, heat mats |
| `cooler` | ❄️ | Air conditioners, coolers |
| `pump` | ⚡ | Water pumps, air pumps |
| `valve` | 🚰 | Solenoid valves, water valves |
| `default` | 🔌 | Any other device |

## Entity Requirements

- **Domain**: Must be `switch.*`
- **States**: `on`, `off`, or `unavailable`
- **Example**: `switch.grow_light`

## Visual States

### ON State
- Colored gradient background
- Bright icon
- "ON" label
- Elevated appearance

### OFF State
- Gray background
- Dimmed icon (50% opacity)
- "OFF" label
- Flat appearance

### Unavailable State
- Grayed out
- "Unavailable" label
- Not clickable
- 50% opacity

## Examples

### Basic Lighting Control

```yaml
type: custom:grow-switch-card
title: Lights
switches:
  - entity: switch.main_light
    name: Main Light
    type: light
  - entity: switch.side_light
    name: Side Light
    type: light
```

### Complete Grow Room

```yaml
type: custom:grow-switch-card
title: Grow Room Equipment
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

### Irrigation System

```yaml
type: custom:grow-switch-card
title: Irrigation
switches:
  - entity: switch.main_pump
    name: Main Pump
    type: pump
  - entity: switch.zone_1_valve
    name: Zone 1
    type: valve
  - entity: switch.zone_2_valve
    name: Zone 2
    type: valve
  - entity: switch.zone_3_valve
    name: Zone 3
    type: valve
```

### Climate Control

```yaml
type: custom:grow-switch-card
title: Climate
switches:
  - entity: switch.heater
    name: Heater
    type: heater
  - entity: switch.ac_unit
    name: AC
    type: cooler
  - entity: switch.humidifier
    type: humidifier
  - entity: switch.dehumidifier
    type: dehumidifier
```

### Minimal Setup (No Names)

```yaml
type: custom:grow-switch-card
switches:
  - entity: switch.light
    type: light
  - entity: switch.fan
    type: fan
```

## Layout

The card uses a responsive grid layout:
- **Desktop**: Multiple columns (auto-fit, minimum 140px)
- **Mobile**: Fewer columns, larger touch targets
- **Spacing**: 12px gap between switches

## Interaction

### Toggle Device

1. Click/tap on any switch card
2. Device toggles between ON and OFF
3. Visual feedback immediate
4. State updates when confirmed by Home Assistant

### Unavailable Devices

- Cannot be toggled
- Shows "Unavailable" status
- Grayed out appearance
- Cursor shows "not-allowed"

## Troubleshooting

### Switch doesn't toggle

**Solution**:
1. Verify entity is a `switch.*` domain
2. Check entity is not unavailable
3. Ensure you have permission to control the entity
4. Check Home Assistant logs for errors

### Wrong icon showing

**Solution**:
1. Set the `type` parameter correctly
2. Available types: light, fan, humidifier, dehumidifier, heater, cooler, pump, valve
3. Use `default` type for generic devices

### Switch shows as unavailable

**Solution**:
1. Check entity exists in Developer Tools → States
2. Verify entity ID is correct
3. Ensure device is connected and working
4. Check integration is loaded

### Name not displaying

**Solution**:
1. Set `name` parameter explicitly
2. Or set `friendly_name` attribute on the entity
3. Check entity has a name in Developer Tools → States

### Card not updating

**Solution**:
1. Check entity state changes in Developer Tools → States
2. Refresh browser
3. Clear browser cache
4. Check Home Assistant connection

## Styling

The card uses Home Assistant theme variables:

- `--card-background-color` - Card background
- `--primary-color` - ON state gradient start
- `--accent-color` - ON state gradient end
- `--secondary-background-color` - OFF state background
- `--primary-text-color` - Text color

## Best Practices

1. **Group related devices** - Keep similar equipment together
2. **Use descriptive names** - Make it clear what each switch controls
3. **Choose appropriate types** - Use correct device type for proper icon
4. **Organize by function** - Create separate cards for lighting, climate, irrigation
5. **Test toggles** - Verify each switch works before relying on it

## Automation Integration

### Turn on lights at sunrise

```yaml
automation:
  - alias: "Lights on at sunrise"
    trigger:
      - platform: sun
        event: sunrise
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.grow_light
```

### Turn off equipment at night

```yaml
automation:
  - alias: "Equipment off at night"
    trigger:
      - platform: time
        at: "22:00:00"
    action:
      - service: switch.turn_off
        target:
          entity_id:
            - switch.exhaust_fan
            - switch.circulation_fan
```

### Toggle based on temperature

```yaml
automation:
  - alias: "Heater control"
    trigger:
      - platform: numeric_state
        entity_id: sensor.temperature
        below: 20
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.heater
```

## Related Cards

- [Environment Monitor Card](Environment-Monitor-Card) - Monitor conditions
- [Irrigation Control Card](Irrigation-Control-Card) - Advanced irrigation control

## See Also

- [Configuration Options](Configuration-Options)
- [Automation Integration](Automation-Integration)
- [Troubleshooting](Troubleshooting)
