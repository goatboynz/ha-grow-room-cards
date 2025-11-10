# Troubleshooting Guide

## Common Configuration Errors

### Camera Card: "Please define camera_entity"

**Error Message:**
```
Configuration error
Please define camera_entity
```

**Cause:** Browser cache is showing old version of the card

**Solutions:**

1. **Hard Refresh Browser Cache:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
   - Or clear browser cache completely

2. **Verify Resource URL:**
   - Go to Settings → Dashboards → Resources
   - Check the resource URL is correct
   - Try adding `?v=2.1` to the end of the URL to force reload

3. **Restart Home Assistant:**
   ```bash
   # In Home Assistant
   Developer Tools → YAML → Restart
   ```

4. **Check Configuration Format:**
   Your RTSP URL should be in quotes on a single line:
   ```yaml
   type: custom:grow-camera-card
   rtsp_url: "rtsp://192.168.1.228:554/user=goatboy_password=SmokeupDab710_channel=6_stream=1.sdp"
   rtsp_username: goatboy
   rtsp_password: SmokeupDab710
   snapshot_times:
     - "06:00"
     - "12:00"
     - "18:00"
     - "00:00"
   snapshot_storage: /config/www/snapshots/
   ```

### Switch Card: "Please define at least one switch"

**Error Message:**
```
Configuration error
Please define at least one switch
```

**Cause:** YAML indentation is incorrect or switches array is empty

**Solution:**

Check your YAML indentation carefully. Each level should be indented by 2 spaces:

```yaml
type: custom:grow-switch-card
title: Equipment Control
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
```

**Common YAML Mistakes:**

❌ **Wrong:** Missing indentation
```yaml
tabs:
- name: Lighting
switches:  # Wrong! Should be indented under the tab
- entity: switch.light
```

✅ **Correct:** Proper indentation
```yaml
tabs:
  - name: Lighting
    switches:  # Correct! Indented under the tab
      - entity: switch.light
```

❌ **Wrong:** Using tabs instead of spaces
```yaml
tabs:
→ - name: Lighting  # Tab character - WRONG!
```

✅ **Correct:** Using spaces
```yaml
tabs:
  - name: Lighting  # Two spaces - CORRECT!
```

### Room Overview Card: "Custom element doesn't exist"

**Error Message:**
```
Custom element doesn't exist: grow-room-overview-card
```

**Solutions:**

1. **Clear Browser Cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)

2. **Check Resource is Added:**
   - Go to Settings → Dashboards → Resources
   - Verify `grow-room-overview-card.js` is listed
   - Resource type should be "JavaScript Module"

3. **Restart Home Assistant:**
   - Developer Tools → YAML → Restart

4. **Check Browser Console:**
   - Press F12 to open developer tools
   - Look for JavaScript errors
   - Common issues:
     - 404 error = file not found (check path)
     - Syntax error = file is corrupted (re-download)

## YAML Validation

### Use YAML Checker

Before adding to Home Assistant, validate your YAML:
- Use online YAML validator: http://www.yamllint.com/
- Or use Home Assistant's built-in checker:
  - Developer Tools → YAML → Check Configuration

### Common YAML Issues

1. **Quotes in URLs:**
   ```yaml
   # Good - URL in quotes
   rtsp_url: "rtsp://192.168.1.228:554/stream"
   
   # Bad - Special characters without quotes
   rtsp_url: rtsp://192.168.1.228:554/stream  # May cause issues
   ```

2. **List Items:**
   ```yaml
   # Good - Dash with space
   snapshot_times:
     - "06:00"
     - "12:00"
   
   # Bad - No space after dash
   snapshot_times:
     -"06:00"  # Wrong!
   ```

3. **Indentation:**
   ```yaml
   # Good - Consistent 2-space indentation
   tabs:
     - name: Lighting
       switches:
         - entity: switch.light
   
   # Bad - Mixed indentation
   tabs:
    - name: Lighting
        switches:  # Wrong indentation!
       - entity: switch.light
   ```

## Browser Cache Issues

If you're seeing old error messages after updating:

1. **Clear Site Data:**
   - Chrome: F12 → Application → Clear Storage → Clear site data
   - Firefox: F12 → Storage → Clear All
   - Safari: Develop → Empty Caches

2. **Incognito/Private Mode:**
   - Test in incognito mode to verify it's a cache issue

3. **Force Reload Resources:**
   - Add version parameter to resource URL:
   ```
   /local/grow-room-cards/grow-camera-card.js?v=2.1
   ```

## Entity Issues

### Entity Not Found

**Error:** Entity shows as "unavailable" or "unknown"

**Solutions:**

1. **Check Entity ID:**
   - Go to Developer Tools → States
   - Search for your entity
   - Copy the exact entity ID

2. **Check Entity Domain:**
   ```yaml
   # Correct domains:
   switch.f2_light        # For switches
   light.f2_light         # For lights
   sensor.f2_temperature  # For sensors
   ```

3. **Wait for Entity:**
   - Some entities take time to appear after restart
   - Check if integration is loaded

## RTSP Camera Issues

### Snapshots Not Saving

**Problem:** Scheduled snapshots aren't being captured

**Solutions:**

1. **Check Shell Command:**
   Verify this is in your `configuration.yaml`:
   ```yaml
   shell_command:
     capture_rtsp_snapshot: >
       ffmpeg -rtsp_transport tcp 
       -i {{ rtsp_url }} 
       -frames:v 1 
       {{ filename }}
   ```

2. **Test FFmpeg:**
   ```bash
   # SSH into Home Assistant
   ffmpeg -version
   # Should show FFmpeg version
   ```

3. **Check Permissions:**
   ```bash
   # Verify snapshot directory exists and is writable
   ls -la /config/www/snapshots/
   ```

4. **Test RTSP URL:**
   ```bash
   # Test if RTSP stream is accessible
   ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.228:554/..." -frames:v 1 test.jpg
   ```

### RTSP Stream Not Displaying

**Problem:** Camera shows black screen or "not available"

**Solutions:**

1. **Use Snapshot URL:**
   If your camera has an HTTP snapshot endpoint, use that:
   ```yaml
   rtsp_snapshot_url: "http://192.168.1.228/snapshot.jpg"
   ```

2. **Check Network:**
   - Verify Home Assistant can reach camera IP
   - Check firewall rules
   - Test from Home Assistant terminal:
     ```bash
     ping 192.168.1.228
     ```

3. **Try Different Stream:**
   Many cameras have multiple streams:
   ```yaml
   # Try stream 0 instead of stream 1
   rtsp_url: "rtsp://192.168.1.228:554/...stream=0.sdp"
   ```

## Getting More Help

### Enable Debug Logging

Add to `configuration.yaml`:
```yaml
logger:
  default: info
  logs:
    custom_components.grow_room_cards: debug
```

### Check Logs

1. Go to Settings → System → Logs
2. Look for errors related to grow-room-cards
3. Copy error messages when asking for help

### Report Issues

When reporting issues, include:
1. Home Assistant version
2. Browser and version
3. Complete error message
4. Your card configuration (remove passwords!)
5. Browser console errors (F12)

### Community Support

- GitHub Issues: https://github.com/goatboynz/ha-grow-room-cards/issues
- Home Assistant Community Forum
- Include your configuration (sanitized) and error messages

## Quick Fixes Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Restart Home Assistant
- [ ] Check YAML indentation (use 2 spaces, not tabs)
- [ ] Verify entity IDs in Developer Tools → States
- [ ] Check browser console for errors (F12)
- [ ] Validate YAML syntax
- [ ] Clear browser cache completely
- [ ] Check resource is added correctly
- [ ] Verify file paths are correct
- [ ] Test in incognito/private mode

---

**Last Updated:** November 11, 2025
**Version:** 2.1
