# Clear Browser Cache - Required!

## The Problem

You're seeing these errors because your browser has cached old versions of the JavaScript files:
- `can't access property "map", this.config.timelapse_times is undefined`
- `Custom element doesn't exist: grow-vpd-chart-card`
- `Custom element doesn't exist: grow-room-overview-card`

## The Solution

### Step 1: Remove Old Resources

1. Go to **Settings** → **Dashboards** → **Resources**
2. **DELETE** all grow-room-cards resources
3. Click **Save**

### Step 2: Add New Resources with Version

Add these resources with `?v=1.0` at the end:

```
/local/grow-room-cards/grow-room-cards.js?v=1.0
```

Or add individual cards:
```
/local/grow-room-cards/grow-room-overview-card.js?v=1.0
/local/grow-room-cards/grow-vpd-chart-card.js?v=1.0
/local/grow-room-cards/grow-camera-card.js?v=1.0
/local/grow-room-cards/grow-switch-card.js?v=1.0
/local/grow-room-cards/grow-environment-card.js?v=1.0
/local/grow-room-cards/grow-report-card.js?v=1.0
```

All should be type: **JavaScript Module**

### Step 3: Clear Browser Cache

**Chrome/Edge:**
1. Press `F12` to open Developer Tools
2. Right-click the refresh button (next to address bar)
3. Select **"Empty Cache and Hard Reload"**

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select **"Cached Web Content"**
3. Time range: **"Everything"**
4. Click **"Clear Now"**
5. Then press `Ctrl + F5` to hard refresh

**Safari:**
1. Press `Cmd + Option + E` to empty caches
2. Then press `Cmd + R` to reload

### Step 4: Restart Home Assistant

1. Go to **Developer Tools** → **YAML**
2. Click **"Restart"**
3. Wait for Home Assistant to fully restart (1-2 minutes)

### Step 5: Verify

After restart:
1. Open browser console (F12)
2. Look for: `Grow Room Overview Card v1.0 initialized`
3. No errors should appear

## Still Not Working?

### Nuclear Option - Complete Cache Clear

**Chrome/Edge:**
```
1. Settings → Privacy and Security → Clear browsing data
2. Time range: "All time"
3. Check: "Cached images and files"
4. Click "Clear data"
5. Close and reopen browser
```

**Firefox:**
```
1. Settings → Privacy & Security
2. Cookies and Site Data → "Clear Data"
3. Check "Cached Web Content"
4. Click "Clear"
5. Close and reopen browser
```

### Test in Incognito/Private Mode

1. Open incognito/private window
2. Go to your Home Assistant
3. If it works there, it's definitely a cache issue
4. Clear cache in normal browser

### Check File Locations

Verify files exist:
```bash
ls -la /config/www/grow-room-cards/
```

Should see:
- grow-room-overview-card.js
- grow-vpd-chart-card.js
- grow-camera-card.js
- etc.

### Check Browser Console

Press F12 and look for:
- Red errors = something is wrong
- `Grow Room Overview Card v1.0 initialized` = card loaded correctly
- 404 errors = file not found (check path)

## Why This Happens

Browsers cache JavaScript files aggressively for performance. When you update a file, the browser doesn't know it changed and keeps using the old cached version.

Adding `?v=1.0` to the URL tells the browser "this is a different file" and forces it to download the new version.

## Prevention

Always use version numbers in your resource URLs:
```
/local/grow-room-cards/grow-room-cards.js?v=1.0
```

When you update, change the version:
```
/local/grow-room-cards/grow-room-cards.js?v=1.1
```

---

**This WILL fix your issues if followed exactly!**
