// content.js
let overlayDiv = null;
let debugDiv = null;
let currentMinutes = 0;
let currentSeconds = 0;

// Get domain of current page
function getCurrentDomain() {
  return window.location.hostname;
}

// Create debug counter display
function createDebugDisplay() {
  if (debugDiv) return;
  
  debugDiv = document.createElement('div');
  debugDiv.id = 'mindful-browsing-debug';
  debugDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 14px;
    z-index: 2147483646;
    min-width: 200px;
  `;
  document.documentElement.appendChild(debugDiv);
}

// Update debug display
function updateDebugDisplay(seconds, opacity) {
  if (!debugDiv) return;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  debugDiv.innerHTML = `
    <div><strong>Mindful Browsing</strong></div>
    <div style="margin-top: 10px;">Time: ${minutes}m ${remainingSeconds}s</div>
    <div>Opacity: ${(opacity * 100).toFixed(1)}%</div>
    <div style="margin-top: 5px; font-size: 11px; color: #aaa;">Domain: ${getCurrentDomain()}</div>
  `;
}

// Create overlay element
function createOverlay(imageUrl, seconds) {
  if (overlayDiv) {
    updateOverlay(seconds);
    return;
  }

  overlayDiv = document.createElement('div');
  overlayDiv.id = 'mindful-browsing-overlay';
  overlayDiv.style.backgroundImage = `url(${imageUrl})`;
  
  document.documentElement.appendChild(overlayDiv);
  
  // Create debug display
  createDebugDisplay();
  
  updateOverlay(seconds);
  
  // Update every second
  setInterval(async () => {
    const data = await chrome.storage.local.get(['timeSpent']);
    const timeSpent = data.timeSpent || {};
    const domain = getCurrentDomain();
    const newSeconds = timeSpent[domain] || 0;
    updateOverlay(newSeconds);
  }, 1000);
}

// Update overlay opacity
function updateOverlay(seconds) {
  if (!overlayDiv) return;
  
  currentSeconds = seconds;
  const minutes = seconds / 60;
  
  // TESTING MODE: Opacity increases from 0 to 1 over 10 minutes instead of 60
  const opacity = Math.min(minutes / 60, 1);  // Change 10 back to 60 for production
  overlayDiv.style.opacity = opacity;
  
  // Update debug display
  updateDebugDisplay(seconds, opacity);
  
  // At 100% opacity, make overlay block all interaction
  if (opacity >= 1) {
    overlayDiv.style.pointerEvents = 'auto';
  } else {
    overlayDiv.style.pointerEvents = 'none';
  }
}

// Remove overlay
function removeOverlay() {
  if (overlayDiv) {
    overlayDiv.remove();
    overlayDiv = null;
  }
  if (debugDiv) {
    debugDiv.remove();
    debugDiv = null;
  }
}

// Initialize
async function init() {
  console.log('[Mindful Browsing] Initializing...');
  const domain = getCurrentDomain();
  console.log('[Mindful Browsing] Current domain:', domain);
  
  const data = await chrome.storage.local.get([
    'trackedDomains',
    'overlayImage',
    'timeSpent'
  ]);
  
  console.log('[Mindful Browsing] Tracked domains:', data.trackedDomains);
  console.log('[Mindful Browsing] Has overlay image:', !!data.overlayImage);
  console.log('[Mindful Browsing] Time spent:', data.timeSpent);
  
  const trackedDomains = data.trackedDomains || [];
  const isTracked = trackedDomains.some(d => 
    domain.includes(d) || d.includes(domain)
  );
  
  if (isTracked && data.overlayImage) {
    const timeSpent = data.timeSpent || {};
    const seconds = timeSpent[domain] || 0;
    
    createOverlay(data.overlayImage, seconds);
  } else {
    removeOverlay();
  }
}

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_OVERLAY') {
    chrome.storage.local.get(['overlayImage', 'timeSpent'], (data) => {
      if (data.overlayImage) {
        const domain = getCurrentDomain();
        const seconds = message.seconds || (data.timeSpent || {})[domain] || 0;
        if (!overlayDiv) {
          createOverlay(data.overlayImage, seconds);
        } else {
          updateOverlay(seconds);
        }
      }
    });
  }
});


// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-check when storage changes (e.g., user updates settings)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    init();
  }
});
