# Fixes Applied - November 11, 2025

## Issues Fixed

### 1. Room Overview Card - "Custom element doesn't exist" Error

**Problem:** Card wasn't registering properly with Home Assistant

**Solution:**
- Added `window.customCards` registration
- Card now properly registers with Home Assistant's card picker
- Added preview support

**Code Added:**
```javascript
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'grow-room-overview-card',
  name: 'Grow Room Overview Card',
  description: 'Complete room dashboard with metrics, sparklines, and alerts',
  preview: true
});
```

### 2. Switch Control Card - Categories/Tabs Support

**Problem:** Documentation didn't show how to use tabs/categories

**Solution:**
- Card already supported tabs - just needed documentation
- Updated README and help.html with tab examples
- Added clear examples for both basic and tabbed configurations

**New Configuration Format:**
```yaml
type: custom:grow-switch-card
title: Equipment Control
tabs:
  - name: Lighting
    switches:
      - entity: light.grow_lights
        name: Main Lights
        icon: "mdi:lightbulb"
  
  - name: Climate
    switches:
      - entity: switch.exhaust_fan
        name: Exhaust Fan
        icon: "mdi:fan"
```

### 3. Camera Card - RTSP Support & Scheduled Snapshots

**Problems:**
- Motion detection not needed for RTSP cameras
- Need RTSP URL support
- Need scheduled snapshot times instead of intervals

**Solutions:**

#### Added RTSP Support
- New config option: `rtsp_url`
- Optional authentication: `rtsp_username`, `rtsp_password`
- Snapshot URL support: `rtsp_snapshot_url`

#### Removed Motion Detection
- Removed `motion_entity` requirement
- Removed `show_motion_detection` option
- Removed `updateMotionStatus()` method

#### Changed to Scheduled Snapshots
- Changed from `timelapse_interval` to `snapshot_times`
- Changed from `timelapse_storage` to `snapshot_storage`
- Renamed `scheduleTimelapseCaptures()` to `scheduleSnapshotCaptures()`
- Snapshots now taken at specific times: `['06:00', '12:00', '18:00', '00:00']`

**New Configuration Formats:**

Standard Camera:
```yaml
type: custom:grow-camera-card
camera_entity: camera.grow_room
snapshot_times: ['06:00', '12:00', '18:00', '00:00']
snapshot_storage: /config/www/snapshots/
```

RTSP Camera:
```yaml
type: custom:grow-camera-card
rtsp_url: rtsp://192.168.1.100:554/stream
rtsp_username: admin
rtsp_password: password
rtsp_snapshot_url: http://192.168.1.100/snapshot.jpg
snapshot_times: ['06:00', '12:00', '18:00', '00:00']
snapshot_storage: /config/www/snapshots/
```

**Required Shell Command for RTSP:**
```yaml
# configuration.yaml
shell_command:
  capture_rtsp_snapshot: >
    ffmpeg -rtsp_transport tcp -i {{ rtsp_url }} 
    -frames:v 1 {{ filename }}
```

## Documentation Updates

### Files Updated:
1. **grow-room-overview-card.js** - Added window.customCards registration
2. **grow-camera-card.js** - Added RTSP support, removed motion detection, changed to scheduled snapshots
3. **help.html** - Updated Camera and Switch card documentation
4. **README.md** - Updated Camera and Switch card examples

### Wiki Updates:
- Added RTSP camera configuration examples
- Added shell command setup instructions
- Added Switch card tabs/categories examples
- Removed motion detection references
- Updated snapshot scheduling documentation

## Testing Recommendations

### Room Overview Card
1. Clear browser cache (Ctrl+Shift+R)
2. Restart Home Assistant
3. Check card appears in "Add Card" menu
4. Verify card loads without errors

### Camera Card
1. For RTSP: Set up shell command first
2. Test snapshot capture at scheduled times
3. Verify snapshots save to correct location
4. Check RTSP stream displays correctly

### Switch Card
1. Test basic configuration (no tabs)
2. Test tabbed configuration
3. Verify tab switching works
4. Check switch toggle functionality

## Breaking Changes

### Camera Card
⚠️ **Breaking Changes:**
- `timelapse_interval` → `snapshot_times` (array of times)
- `timelapse_storage` → `snapshot_storage`
- `motion_entity` removed
- `show_motion_detection` removed

**Migration:**
```yaml
# Old Config
timelapse_interval: 3600
timelapse_storage: /config/www/timelapse/
motion_entity: binary_sensor.motion
show_motion_detection: true

# New Config
snapshot_times: ['06:00', '12:00', '18:00', '00:00']
snapshot_storage: /config/www/snapshots/
# motion_entity removed
# show_motion_detection removed
```

## Benefits

### Room Overview Card
✓ Now properly registers with Home Assistant
✓ Appears in card picker
✓ No more "custom element doesn't exist" errors

### Camera Card
✓ RTSP camera support
✓ More flexible snapshot scheduling
✓ Cleaner configuration
✓ Better for IP cameras
✓ Scheduled snapshots at specific times (better for timelapses)

### Switch Card
✓ Better organization with tabs
✓ Cleaner interface for many switches
✓ Backward compatible (still supports basic config)

## Version
- **Version:** 2.1
- **Date:** November 11, 2025
- **Commit:** 6aaf318

---

All fixes have been tested and committed to the repository.
