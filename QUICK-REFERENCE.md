# Quick Reference - Grow Room Cards

## Card Types

| Card | Type | Purpose |
|------|------|---------|
| Environment | `grow-environment-card` | Monitor temp, humidity, CO2, VPD |
| Switches | `grow-switch-card` | Control equipment |
| Irrigation | `grow-irrigation-card` | Manage watering zones |
| VPD Chart | `grow-vpd-chart-card` | VPD analysis |
| Spectrum | `grow-spectrum-card` | Light spectrum |

## Minimal Configs

### Environment
```yaml
type: custom:grow-environment-card
entities:
  temperature: sensor.temp
  humidity: sensor.humidity
```

### Switches
```yaml
type: custom:grow-switch-card
switches:
  - entity: switch.light
    type: light
```

### Irrigation
```yaml
type: custom:grow-irrigation-card
zones:
  - entity: switch.zone_1
    vwc_sensor: sensor.moisture
```

### VPD Chart
```yaml
type: custom:grow-vpd-chart-card
temperature_sensor: sensor.temp
humidity_sensor: sensor.humidity
```

### Spectrum
```yaml
type: custom:grow-spectrum-card
entity: sensor.as7341_spectrum
```

## Common Options

| Option | Cards | Default | Description |
|--------|-------|---------|-------------|
| `title` | All | Card name | Card header text |
| `history_hours` | Environment, Irrigation | 24 | Hours of history |
| `leaf_temperature_offset` | VPD Chart | 2 | Leaf temp offset |
| `enable_crosshair` | VPD Chart | true | Show crosshair |
| `enable_zoom` | VPD Chart | true | Enable zoom |

## Switch Types

| Type | Icon | Use For |
|------|------|---------|
| `light` | 💡 | Grow lights |
| `fan` | 🌀 | Fans |
| `humidifier` | 💨 | Humidifiers |
| `dehumidifier` | 🌬️ | Dehumidifiers |
| `heater` | 🔥 | Heaters |
| `cooler` | ❄️ | Coolers |
| `pump` | ⚡ | Pumps |
| `valve` | 🚰 | Valves |

## Entity Requirements

### Environment Card
- `temperature`: sensor (°C or °F)
- `humidity`: sensor (%)
- `co2`: sensor (ppm) - optional
- `vpd`: sensor (kPa) - optional

### Switch Card
- All entities must be `switch.*` domain

### Irrigation Card
- `entity`: switch (zone control)
- `vwc_sensor`: sensor (%) - optional
- `ec_sensor`: sensor (mS/cm) - optional

### VPD Chart Card
- `temperature_sensor`: sensor (°C or °F)
- `humidity_sensor`: sensor (%)
- `leaf_temperature_sensor`: sensor - optional

### Spectrum Card
- `entity`: sensor with AS7341 attributes

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Card not showing | Clear cache (Ctrl+Shift+R) |
| "Custom element doesn't exist" | Check resource is added |
| Entities unavailable | Verify entity IDs |
| History not loading | Check recorder enabled |
| Switches not working | Verify switch domain |

## Installation

### HACS
1. Add custom repo: `https://github.com/goatboynz/ha-grow-room-cards`
2. Install from HACS
3. Restart HA

### Manual
1. Copy files to `config/www/grow-room-cards/`
2. Add resource: `/local/grow-room-cards/grow-room-cards.js`
3. Restart HA

## Resources

- **Full Docs**: [DOCUMENTATION.md](DOCUMENTATION.md)
- **Setup Guide**: [SETUP-GUIDE.md](SETUP-GUIDE.md)
- **Visual Guide**: [CARDS-OVERVIEW.md](CARDS-OVERVIEW.md)
- **GitHub**: https://github.com/goatboynz/ha-grow-room-cards

## Support

- 🐛 **Bugs**: Open GitHub issue
- 💡 **Features**: Open GitHub discussion
- ❓ **Questions**: Check documentation first

---

**Version**: 1.0.0  
**License**: MIT  
**Author**: goatboynz
