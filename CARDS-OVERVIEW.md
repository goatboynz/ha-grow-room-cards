# Grow Room Cards - Visual Overview

## Card Suite Summary

This collection provides 5 specialized cards for complete grow room management:

---

## 1. 🌡️ Environment Monitor Card

**Purpose**: Real-time environmental monitoring with historical data

**Visual Layout**:
```
┌─────────────────────────────────────┐
│ Environment                         │
├─────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  🌡️   │ │  💧   │ │  🌱   │  │
│  │  22.5  │ │  65.0  │ │  800   │  │
│  │   °C   │ │   %    │ │  ppm   │  │
│  └────────┘ └────────┘ └────────┘  │
│  ┌────────┐                         │
│  │  📊   │                         │
│  │  1.05  │                         │
│  │  kPa   │                         │
│  └────────┘                         │
└─────────────────────────────────────┘
```

**Features**:
- Click any metric to see 24-hour history graph
- Color-coded cards (red=temp, blue=humidity, green=CO2, yellow=VPD)
- Smooth animations
- Auto-updates with sensor changes

---

## 2. 🔌 Switch Control Card

**Purpose**: Control all grow room equipment from one panel

**Visual Layout**:
```
┌─────────────────────────────────────┐
│ Equipment Control                   │
├─────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  💡   │ │  🌀   │ │  💨   │  │
│  │ Light  │ │  Fan   │ │Humidi- │  │
│  │  ON    │ │  OFF   │ │ fier   │  │
│  └────────┘ └────────┘ │  ON    │  │
│  ┌────────┐ ┌────────┐ └────────┘  │
│  │  🌬️   │ │  🔥   │             │
│  │Dehumid-│ │ Heater │             │
│  │ ifier  │ │  OFF   │             │
│  │  OFF   │ └────────┘             │
│  └────────┘                         │
└─────────────────────────────────────┘
```

**Features**:
- One-click toggle for each device
- Visual ON/OFF states (colored when on)
- Custom icons per device type
- Hover effects
- Handles unavailable devices gracefully

**Supported Device Types**:
- 💡 Lights
- 🌀 Fans
- 💨 Humidifiers
- 🌬️ Dehumidifiers
- 🔥 Heaters
- ❄️ Coolers
- ⚡ Pumps
- 🚰 Valves

---

## 3. 💧 Irrigation Control Card

**Purpose**: Manage watering zones with soil monitoring

**Visual Layout**:
```
┌─────────────────────────────────────┐
│ Irrigation Control                  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Zone 1 - Main Bed      [▶ Start]│ │
│ │ ┌──────────┐ ┌──────────┐      │ │
│ │ │   VWC    │ │    EC    │      │ │
│ │ │   45.2%  │ │ 1.8 mS/cm│      │ │
│ │ └──────────┘ └──────────┘      │ │
│ │ [📊 VWC History] [📊 EC History]│ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Zone 2 - Side Bed      [⏸ Stop]│ │
│ │ ┌──────────┐ ┌──────────┐      │ │
│ │ │   VWC    │ │    EC    │      │ │
│ │ │   38.7%  │ │ 2.1 mS/cm│      │ │
│ │ └──────────┘ └──────────┘      │ │
│ │ [📊 VWC History] [📊 EC History]│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features**:
- Multiple zone support
- Start/Stop buttons per zone
- Real-time VWC (soil moisture) display
- Real-time EC (nutrient level) display
- Click graph buttons to view 24-hour trends
- Active zones highlighted in green

**Metrics**:
- **VWC**: Volumetric Water Content (%)
- **EC**: Electrical Conductivity (mS/cm)

---

## 4. 📊 VPD Chart Card

**Purpose**: Interactive Vapor Pressure Deficit analysis

**Visual Layout**:
```
┌─────────────────────────────────────┐
│ VPD Chart                           │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │        [Color-coded Chart]    │  │
│  │  90% ┌─────────────────────┐  │  │
│  │      │ 🔴 🟡 🟢 🟢 🟡 🔴 │  │  │
│  │  70% │ 🔴 🟡 🟢 🟢 🟡 🔴 │  │  │
│  │      │ 🔴 🟡 🟢 🟢 🟡 🔴 │  │  │
│  │  50% │ 🔴 🟡 🟢 🟢 🟡 🔴 │  │  │
│  │      │ 🔴 🟡 🟢 🟢 🟡 🔴 │  │  │
│  │  30% └─────────────────────┘  │  │
│  │       15°  20°  25°  30°  35° │  │
│  └───────────────────────────────┘  │
│  ┌──────────┐ ┌──────────┐         │
│  │ Leaf VPD │ │ Room VPD │         │
│  │  1.05 kPa│ │  1.12 kPa│         │
│  └──────────┘ └──────────┘         │
└─────────────────────────────────────┘
```

**Features**:
- Color-coded VPD zones
- Interactive crosshair (follows mouse)
- Zoom with mouse wheel
- Pan when zoomed (click and drag)
- Hover tooltip shows VPD at any point
- Current conditions marked with pink dot
- Separate Leaf and Room VPD calculations

**Color Zones**:
- 🔵 Blue: Under-transpiration (too low)
- 🟢 Green: Optimal for vegetative growth
- 🟡 Yellow: Optimal for flowering
- 🔴 Red: Too high (stress zone)

---

## 5. 🌈 Spectrum Sensor Card

**Purpose**: Visualize light spectrum from AS7341 sensor

**Visual Layout**:
```
┌─────────────────────────────────────┐
│ Light Spectrum Analysis             │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │    [Rainbow Gradient Chart]   │  │
│  │ 100%┌─────────────────────┐   │  │
│  │     │ ╱╲    ╱╲    ╱╲      │   │  │
│  │  75%│╱  ╲  ╱  ╲  ╱  ╲     │   │  │
│  │     │    ╲╱    ╲╱    ╲    │   │  │
│  │  50%│                 ╲   │   │  │
│  │     │                  ╲  │   │  │
│  │  25%│                   ╲ │   │  │
│  │     └─────────────────────┘   │  │
│  │     415 480 555 630 NIR       │  │
│  │     nm  nm  nm  nm            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Features**:
- 10-channel spectral display
- Rainbow gradient background
- Smooth curve interpolation
- Hover tooltips with wavelength info
- Shows all visible spectrum + NIR

**Channels**:
- 415nm (Violet)
- 445nm (Blue)
- 480nm (Cyan)
- 515nm (Green)
- 555nm (Yellow-Green)
- 590nm (Yellow)
- 630nm (Orange)
- 680nm (Red)
- Clear (full spectrum)
- NIR (Near Infrared)

---

## Design Philosophy

All cards share:
- **Unified Color Scheme**: Uses Home Assistant theme colors
- **Consistent Spacing**: 16px padding, 12px gaps
- **Smooth Animations**: 0.3s transitions
- **Responsive Layout**: Works on desktop and mobile
- **Dark/Light Mode**: Adapts to your HA theme
- **Touch Friendly**: Large tap targets for mobile

## Typical Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Environment Card (full width)              │
├─────────────────────────────────────────────┤
│  VPD Chart Card (full width)                │
├──────────────────────┬──────────────────────┤
│  Switch Control      │  Irrigation Control  │
│  (half width)        │  (half width)        │
├──────────────────────┴──────────────────────┤
│  Spectrum Card (full width)                 │
└─────────────────────────────────────────────┘
```

## Color Palette

**Environment Card**:
- Temperature: Red gradient (#FF6B6B → #FF8E53)
- Humidity: Teal gradient (#4ECDC4 → #44A08D)
- CO2: Green gradient (#A8E6CF → #56AB91)
- VPD: Yellow gradient (#FFD93D → #F6C90E)

**Switch Card**:
- ON state: Primary color gradient
- OFF state: Secondary background
- Hover: Lift effect with shadow

**Irrigation Card**:
- Active zone: Green tint
- VWC graph: Blue (#2196F3)
- EC graph: Orange (#FF9800)

**VPD Chart**:
- Too Low: Gray (#999999)
- Under-transpiration: Blue (#1a6c9c)
- Early Veg: Teal (#22ab9c)
- Late Veg: Green (#9cc55b)
- Mid-Late Flower: Yellow (#e7c12b)
- Danger: Red (#ce4234)

---

## Integration Examples

### With Automations
```yaml
automation:
  - alias: "High VPD Alert"
    trigger:
      - platform: numeric_state
        entity_id: sensor.grow_room_vpd
        above: 1.6
    action:
      - service: notify.mobile_app
        data:
          message: "VPD too high! Check environment card."
```

### With Scripts
```yaml
script:
  water_all_zones:
    sequence:
      - service: switch.turn_on
        target:
          entity_id:
            - switch.irrigation_zone_1
            - switch.irrigation_zone_2
      - delay: "00:05:00"
      - service: switch.turn_off
        target:
          entity_id:
            - switch.irrigation_zone_1
            - switch.irrigation_zone_2
```

---

## Mobile Optimization

All cards are fully responsive:
- **Portrait**: Cards stack vertically
- **Landscape**: Cards use grid layout
- **Touch**: Large tap targets (minimum 44x44px)
- **Gestures**: Swipe to navigate history graphs

---

## Performance

- **Lightweight**: ~50KB total (all cards)
- **Fast Rendering**: Canvas-based charts
- **Efficient Updates**: Only re-renders on state changes
- **History Caching**: Reduces API calls

---

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- ⚠️ IE11 not supported

---

Ready to transform your grow room dashboard! 🌱
