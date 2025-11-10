# DEFINITIVE FIX - Browser Cache Issues

## The Problem

You're seeing these errors:
1. "Please define camera_entity" (Camera Card)
2. "Please define at least one switch" (Switch Card)  
3. "Custom element doesn't exist: grow-room-overview-card"

**Root Cause:** Your browser has cached the OLD versions of the JavaScript files. The new code is correct, but your browser is loading old files from cache.

## The Solution - Step by Step

### Step 1: Remove Old Resources

1. Go to **Settings** → **Dashboards** → **Resources**
2. Find and **DELETE** these resources:
   - `/local/grow-room-cards/grow-camera-card.js`
   - `/local/grow-room-cards/grow-switch-card.js`
   - `/local/grow-room-cards/grow-room-overview-card.js`
3. Click **Save**

### Step 2: Add New Resource with Version

1. Still in **Settings** → **Dashboards** → **Resources**
2. Click **Add Resource**
3. URL: `/local/grow-room-cards/grow-camera-card.js?v=2.1`
4. Resource type: **JavaScript Module**
5. Click **Create**

6. Click **Add Resource** again
7. URL: `/local/grow-room-cards/grow-switch-card.js?v=2.1`
8. Resource type: **JavaScript Module**
9. Click **Create**

10. Click **Add Resource** again
11. URL: `/local/grow-room-cards/grow-room-overview-card.js?v=2.1`
12. Resource type: **JavaScript Module**
13. Click **Create**

### Step 3: Clear Browser Cache

**Chrome/Edge:**
1. Press `F12` to open Developer Tools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached Web Content"
3. Click "Clear Now"

**Safari:**
1. Press `Cmd + Option + E` to empty caches
2. Then `Cmd + R` to reload

### Step 4: Restart Home Assistant

1. Go to **Developer Tools** → **YAML**
2. Click **Restart**
3. Wait for Home Assistant to fully restart

### Step 5: Test Your Cards

Use these exact configurations:

**Camera Card:**
```yaml
type: custom:grow-camera-card
title: F2 Camera
rtsp_url: "rtsp://192.168.1.228:554/user=goatboy_password=SmokeupDab710_channel=6_stream=1.sdp"
rtsp_username: goatboy
rtsp_password: SmokeupDab710
rtsp_snapshot_url: "http://192.168.1.228/snapshot.jpg"
snapshot_times:
  - "06:00"
  - "12:00"
  - "18:00"
  - "00:00"
snapshot_storage: /config/www/snapshots/
```

**Switch Card:**
```yaml
type: custom:grow-switch-card
title: F2 Equipment Control
tabs:
  - name: Lighting
    switches:
      - entity: switch.f2_light
        name: Main Lights
        icon: "mdi:lightbulb"
      - entity: switch.f2_lights1
        name: UV Lights
        icon: "mdi:lightbulb-outline"
  
  - name: Climate
    switches:
      - entity: switch.f2_exhaust_fan
        name: Exhaust Fan
        icon: "mdi:fan"
      - entity: switch.f2_humidifier
        name: Humidifier
        icon: "mdi:water"
  
  - name: Irrigation
    switches:
      - entity: switch.f2_irrigation_pump
        name: Main Pump
        icon: "mdi:water-pump"
```

**Room Overview Card:**
```yaml
type: custom:grow-room-overview-card
title: F2 Flowering Room
room_name: F2 Flowering Room
start_date_entity: input_datetime.f2_flower_start
lights_entity: switch.f2_light
temperature_entity: sensor.f2_temperature
humidity_entity: sensor.f2_humidity
vpd_entity: sensor.f2_vpd
co2_entity: sensor.f2_co2
show_sparklines: true
```

## Alternative: Nuclear Option

If the above doesn't work, do this:

### 1. Completely Clear Browser

**Chrome/Edge:**
```
1. Settings → Privacy and Security → Clear browsing data
2. Select "All time"
3. Check "Cached images and files"
4. Click "Clear data"
```

**Firefox:**
```
1. Settings → Privacy & Security → Cookies and Site Data
2. Click "Clear Data"
3. Check "Cached Web Content"
4. Click "Clear"
```

### 2. Use Incognito/Private Mode

Test in a private browsing window to verify it's working without cache.

### 3. Try Different Browser

If it works in a different browser, it confirms cache issue.

## Verification

After following all steps, check browser console (F12):

You should see:
- No errors about "custom element doesn't exist"
- No errors about "Please define camera_entity"
- No errors about "Please define at least one switch"

If you still see errors, they will be DIFFERENT errors (like entity not found), which means the cache is cleared and we can troubleshoot the real issue.

## Why This Happens

Home Assistant and browsers aggressively cache JavaScript files for performance. When you update a file, the browser doesn't know it changed and keeps using the old cached version.

Adding `?v=2.1` to the URL tells the browser "this is a different file" and forces it to download the new version.

## Prevention

Always add version numbers to your resources:
```
/local/grow-room-cards/grow-camera-card.js?v=2.1
```

When you update, change the version:
```
/local/grow-room-cards/grow-camera-card.js?v=2.2
```

## Still Not Working?

If after ALL these steps you still have issues:

1. Check browser console (F12) for the EXACT error
2. Verify the files are actually in `/config/www/grow-room-cards/`
3. Check file permissions (should be readable)
4. Try accessing the file directly: `http://your-ha-ip:8123/local/grow-room-cards/grow-camera-card.js`

If you can't access the file directly, it's a file location/permission issue, not a cache issue.

---

**This WILL fix your issues if followed exactly.**
