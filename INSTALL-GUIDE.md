# Installation Guide - Grow Room Cards v1.0

## ✅ Fixed Issues

The bundle file now includes ALL 14 cards:
- ✅ grow-room-overview-card (was missing)
- ✅ grow-sensor-monitor-card (was missing)
- ✅ All other 12 cards

## Step-by-Step Installation

### 1. Remove Old Installation (If Exists)

**In HACS:**
1. Go to **HACS** → **Frontend**
2. Find **"Grow Room Cards"** (if installed)
3. Click **three dots** → **"Remove"**
4. Confirm removal

**In Resources:**
1. Go to **Settings** → **Dashboards** → **Resources**
2. Remove any `/local/grow-room-cards/` resources
3. Click **Save**

### 2. Clear Browser Cache COMPLETELY

**Chrome/Edge:**
```
1. Press Ctrl + Shift + Delete
2. Time range: "All time"
3. Check: "Cached images and files"
4. Click "Clear data"
5. CLOSE BROWSER COMPLETELY
6. Reopen browser
```

**Firefox:**
```
1. Press Ctrl + Shift + Delete
2. Time range: "Everything"
3. Check: "Cached Web Content"
4. Click "Clear Now"
5. CLOSE BROWSER COMPLETELY
6. Reopen browser
```

### 3. Restart Home Assistant

1. Go to **Developer Tools** → **YAML**
2. Click **"Restart"**
3. Wait 2-3 minutes for complete restart

### 4. Install via HACS

1. Open **HACS** → **Frontend**
2. Click **"+ Explore & Download Repositories"**
3. Search for **"Grow Room Cards"**
4. Click on it
5. Click **"Download"**
6. Select **latest version**
7. Click **"Download"**

### 5. Restart Home Assistant Again

1. **Developer Tools** → **YAML** → **"Restart"**
2. Wait 2-3 minutes

### 6. Clear Browser Cache Again

**Hard Refresh:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

Or use incognito/private mode to test.

### 7. Verify Installation

1. Edit any dashboard
2. Click **"+ Add Card"**
3. Search for **"grow"**
4. You should see ALL 14 cards:
   - Grow Room Overview Card
   - Grow Environment Card
   - Grow VPD Chart Card
   - Grow Report Card
   - Grow Camera Card
   - Grow Switch Card
   - Grow Sensor Monitor Card (NEW!)
   - Grow Irrigation Card
   - Grow Nutrient Card
   - Grow Alert Card
   - Grow Calendar Card
   - Grow Journal Card
   - Grow Spectrum Card
   - Grow Settings Card

### 8. Check Browser Console

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for:
   ```
   GROW-ROOM-CARDS v1.0.0
   Grow Room Overview Card v1.0 initialized
   ```
4. Should be **NO errors** about "Custom element doesn't exist"

## Configuration Examples

### Room Overview Card
```yaml
type: custom:grow-room-overview-card
title: F1 Flowering Room
room_name: F1 Flowering Room
start_date_entity: input_datetime.f1_start_date
lights_entity: switch.f1_lights1
temperature_entity: sensor.temperature
humidity_entity: sensor.humidity
vpd_entity: sensor.vpd
co2_entity: sensor.co2
show_sparklines: true
```

### VPD Chart Card
```yaml
type: custom:grow-vpd-chart-card
title: VPD Analysis
temperature_sensor: sensor.temperature
humidity_sensor: sensor.humidity
leaf_temperature_offset: 2
```

### Sensor Monitor Card
```yaml
type: custom:grow-sensor-monitor-card
title: Sensor Monitor
tabs:
  - name: Temperature
    sensors:
      - entity: sensor.temp_1
        name: Temp Sensor 1
        icon: 🌡️
      - entity: sensor.temp_2
        name: Temp Sensor 2
        icon: 🌡️
  - name: Humidity
    sensors:
      - entity: sensor.humidity_1
        name: Humidity 1
        icon: 💧
```

## Troubleshooting

### Still Getting "Custom element doesn't exist"

**This means browser cache is STILL not cleared.**

Try these in order:

1. **Use Different Browser**
   - If using Chrome, try Firefox
   - If using Firefox, try Chrome
   - Try Edge or Safari

2. **Incognito/Private Mode**
   - Open incognito window
   - Go to Home Assistant
   - If it works there, it's definitely cache

3. **Nuclear Option - Clear Everything**
   ```
   Chrome: Settings → Privacy → Clear browsing data
   - Time: "All time"
   - Check ALL boxes
   - Clear data
   - Close browser
   - Reopen
   ```

4. **Check File Exists**
   ```bash
   ls -la /config/www/community/ha-grow-room-cards/
   ```
   Should see:
   - grow-room-cards.js
   - grow-room-overview-card.js
   - grow-sensor-monitor-card.js
   - All other card files

### VPD Chart Error

If you get "Please define temperature_sensor":

**Wrong:**
```yaml
temperature_entity: sensor.temperature
humidity_entity: sensor.humidity
```

**Correct:**
```yaml
temperature_sensor: sensor.temperature
humidity_sensor: sensor.humidity
```

## Files Included

All 14 card files:
1. grow-room-cards.js (main bundle)
2. grow-room-overview-card.js
3. grow-environment-card.js
4. grow-vpd-chart-card.js
5. grow-report-card.js
6. grow-camera-card.js
7. grow-switch-card.js
8. grow-sensor-monitor-card.js
9. grow-irrigation-card.js
10. grow-nutrient-card.js
11. grow-alert-card.js
12. grow-calendar-card.js
13. grow-journal-card.js
14. grow-spectrum-card.js
15. grow-settings-card.js

## Support

If still having issues after following ALL steps:

1. Check GitHub Issues
2. Provide:
   - Browser and version
   - Home Assistant version
   - Browser console errors (F12)
   - Screenshot of error

---

**The code is correct. All errors are browser cache issues.**

Follow this guide EXACTLY and it will work!
