# Installation Guide

This guide will walk you through installing Grow Room Cards in Home Assistant.

## Prerequisites

- Home Assistant installed and running
- Access to Home Assistant configuration
- Basic knowledge of YAML (for manual configuration)

## Method 1: HACS Installation (Recommended)

HACS (Home Assistant Community Store) is the easiest way to install and keep the cards updated.

### Step 1: Install HACS

If you don't have HACS installed:

1. Visit [HACS Installation Guide](https://hacs.xyz/docs/setup/download)
2. Follow the installation instructions
3. Restart Home Assistant

### Step 2: Add Custom Repository

1. Open **HACS** in Home Assistant
2. Click on **Frontend** tab
3. Click the **⋮** menu (three dots) in the top right
4. Select **Custom repositories**
5. In the dialog:
   - **Repository**: `https://github.com/goatboynz/ha-grow-room-cards`
   - **Category**: `Lovelace`
6. Click **Add**

### Step 3: Install the Cards

1. In HACS Frontend, search for **"Grow Room Cards"**
2. Click on the card
3. Click **Download** (or **Install**)
4. Select the latest version
5. Click **Download**

### Step 4: Restart Home Assistant

1. Go to **Settings** → **System**
2. Click **Restart**
3. Wait for Home Assistant to restart

### Step 5: Clear Browser Cache

**Important**: You must clear your browser cache for the cards to load.

- **Windows/Linux**: Press `Ctrl + Shift + R`
- **Mac**: Press `Cmd + Shift + R`
- **Mobile**: Clear browser cache in settings

### Step 6: Verify Installation

1. Go to your dashboard
2. Click **Edit Dashboard**
3. Click **Add Card**
4. Search for "grow" - you should see all 5 cards:
   - Grow Environment Card
   - Grow VPD Chart Card
   - Grow Switch Card
   - Grow Irrigation Card
   - Grow Spectrum Card

✅ **Installation complete!** Proceed to [Quick Start](Quick-Start) to add your first card.

---

## Method 2: Manual Installation

If you prefer not to use HACS, you can install manually.

### Step 1: Download Files

1. Go to [Releases](https://github.com/goatboynz/ha-grow-room-cards/releases)
2. Download the latest release (`.zip` file)
3. Extract the archive

### Step 2: Copy Files

1. Connect to your Home Assistant installation
2. Navigate to your `config` directory
3. Create directory: `config/www/grow-room-cards/`
4. Copy all `.js` files from the extracted archive to this directory

Your structure should look like:
```
config/
└── www/
    └── grow-room-cards/
        ├── grow-room-cards.js
        ├── grow-environment-card.js
        ├── grow-switch-card.js
        ├── grow-irrigation-card.js
        ├── grow-vpd-chart-card.js
        └── grow-spectrum-card.js
```

### Step 3: Add Resource

1. In Home Assistant, go to **Settings** → **Dashboards**
2. Click the **⋮** menu (three dots) in the top right
3. Select **Resources**
4. Click **Add Resource** (bottom right)
5. Fill in:
   - **URL**: `/local/grow-room-cards/grow-room-cards.js`
   - **Resource type**: `JavaScript Module`
6. Click **Create**

### Step 4: Restart Home Assistant

1. Go to **Settings** → **System**
2. Click **Restart**
3. Wait for Home Assistant to restart

### Step 5: Clear Browser Cache

**Important**: Clear your browser cache.

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- **Mobile**: Clear browser cache in settings

### Step 6: Verify Installation

1. Edit your dashboard
2. Click **Add Card**
3. Search for "grow" - all 5 cards should appear

✅ **Installation complete!**

---

## Updating

### Via HACS

1. Open **HACS** → **Frontend**
2. Find **Grow Room Cards**
3. If an update is available, click **Update**
4. Restart Home Assistant
5. Clear browser cache

### Manual Update

1. Download the latest release
2. Replace all files in `config/www/grow-room-cards/`
3. Restart Home Assistant
4. Clear browser cache

---

## Troubleshooting Installation

### Cards don't appear in card picker

**Solution**:
1. Verify resource is added: Settings → Dashboards → Resources
2. Check URL is correct: `/local/grow-room-cards/grow-room-cards.js`
3. Restart Home Assistant
4. Clear browser cache (hard refresh)

### "Custom element doesn't exist" error

**Solution**:
1. Check browser console (F12) for errors
2. Verify files are in correct location
3. Check file permissions (should be readable)
4. Clear browser cache completely

### Files not found (404 error)

**Solution**:
1. Verify files are in `config/www/grow-room-cards/`
2. Check file names match exactly (case-sensitive)
3. Restart Home Assistant
4. Try accessing directly: `http://your-ha-ip:8123/local/grow-room-cards/grow-room-cards.js`

### HACS shows "Not loaded"

**Solution**:
1. Check Home Assistant logs for errors
2. Verify HACS is properly installed
3. Try removing and re-adding the repository
4. Restart Home Assistant

---

## Next Steps

- [Quick Start Guide](Quick-Start) - Add your first card
- [Card Configuration](Card-Configuration) - Configure each card
- [Complete Example](Complete-Example) - See a full dashboard setup

## Need Help?

- Check [Troubleshooting](Troubleshooting) page
- Review [FAQ](FAQ)
- Open an [issue](https://github.com/goatboynz/ha-grow-room-cards/issues)
