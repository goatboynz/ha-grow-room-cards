/**
 * Grow Room Cards Bundle v2.1
 * Cache-busting loader
 * 
 * Use this file in your resources instead of individual cards
 * to ensure latest versions are loaded
 */

console.log('Loading Grow Room Cards v2.1...');

// Import all cards with version timestamp
const version = '2.1.' + Date.now();

// Load Camera Card
import(`./grow-camera-card.js?v=${version}`).then(() => {
  console.log('✓ Camera Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Camera Card:', err);
});

// Load Switch Card
import(`./grow-switch-card.js?v=${version}`).then(() => {
  console.log('✓ Switch Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Switch Card:', err);
});

// Load Room Overview Card
import(`./grow-room-overview-card.js?v=${version}`).then(() => {
  console.log('✓ Room Overview Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Room Overview Card:', err);
});

// Load Environment Card
import(`./grow-environment-card.js?v=${version}`).then(() => {
  console.log('✓ Environment Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Environment Card:', err);
});

// Load VPD Chart Card
import(`./grow-vpd-chart-card.js?v=${version}`).then(() => {
  console.log('✓ VPD Chart Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load VPD Chart Card:', err);
});

// Load Report Card
import(`./grow-report-card.js?v=${version}`).then(() => {
  console.log('✓ Report Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Report Card:', err);
});

// Load Alert Card
import(`./grow-alert-card.js?v=${version}`).then(() => {
  console.log('✓ Alert Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Alert Card:', err);
});

// Load Nutrient Card
import(`./grow-nutrient-card.js?v=${version}`).then(() => {
  console.log('✓ Nutrient Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Nutrient Card:', err);
});

// Load Irrigation Card
import(`./grow-irrigation-card.js?v=${version}`).then(() => {
  console.log('✓ Irrigation Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Irrigation Card:', err);
});

// Load Calendar Card
import(`./grow-calendar-card.js?v=${version}`).then(() => {
  console.log('✓ Calendar Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Calendar Card:', err);
});

// Load Journal Card
import(`./grow-journal-card.js?v=${version}`).then(() => {
  console.log('✓ Journal Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Journal Card:', err);
});

// Load Spectrum Card
import(`./grow-spectrum-card.js?v=${version}`).then(() => {
  console.log('✓ Spectrum Card v2.1 loaded');
}).catch(err => {
  console.error('Failed to load Spectrum Card:', err);
});

console.log('All Grow Room Cards v2.1 loading initiated');
