# Card Names Reference

All cards use the `grow-` prefix for consistency.

## Card Type Names

Use these exact names in your dashboard YAML:

| Card | Type Name | File |
|------|-----------|------|
| Room Overview | `grow-room-overview-card` | grow-room-overview-card.js |
| Environment Monitor | `grow-environment-card` | grow-environment-card.js |
| VPD Chart | `grow-vpd-chart-card` | grow-vpd-chart-card.js |
| Grow Report | `grow-report-card` | grow-report-card.js |
| Camera/Timelapse | `grow-camera-card` | grow-camera-card.js |
| Nutrient Dosing | `grow-nutrient-card` | grow-nutrient-card.js |
| Alert Manager | `grow-alert-card` | grow-alert-card.js |
| Grow Calendar | `grow-calendar-card` | grow-calendar-card.js |
| Grow Journal | `grow-journal-card` | grow-journal-card.js |
| Irrigation Control | `grow-irrigation-card` | grow-irrigation-card.js |
| Switch Control | `grow-switch-card` | grow-switch-card.js |
| Spectrum Sensor | `grow-spectrum-card` | grow-spectrum-card.js |
| Settings | `grow-settings-card` | grow-settings-card.js |

## Usage Example

```yaml
# Correct
type: custom:grow-room-overview-card

# Wrong
type: custom:room-overview-card
type: custom:grow_room_overview_card
```

## Verification

After clearing cache, open browser console (F12) and you should see:
- `Grow Room Overview Card v1.0 initialized`
- No "Custom element doesn't exist" errors

## All Cards Registered

All 13 cards are properly registered with:
- `customElements.define()`
- `window.customCards.push()`

This ensures they appear in Home Assistant's card picker.
