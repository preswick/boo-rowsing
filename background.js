// background.js
let activeTabId = null;
let startTime = null;
let trackingInterval = null;

// Check if we need to reset daily counters
async function checkDailyReset() {
  const data = await chrome.storage.local.get(['lastReset', 'timeSpent']);
  const today = new Date().toDateString();
  
  if (data.lastReset !== today) {
    await chrome.storage.local.set({
      timeSpent: {},
      lastReset: today
    });
  }
}

// Get the domain from a URL
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

// Check if domain is in tracked list
async function isTrackedDomain(domain) {
  const data = await chrome.storage.local.get(['trackedDomains']);
  const tracked = data.trackedDomains || [];
  return tracked.some(d => domain.includes(d) || d.includes(domain));
}

// Update time spent
async function updateTimeSpent(domain, seconds) {
  const data = await chrome.storage.local.get(['timeSpent']);
  const timeSpent = data.timeSpent || {};
  timeSpent[domain] = (timeSpent[domain] || 0) + seconds;
  await chrome.storage.local.set({ timeSpent });
  
  console.log(`[Background] Updated ${domain}: ${timeSpent[domain]} seconds`);
  
  // Notify content script of updated time
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && getDomain(tab.url) === domain) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_OVERLAY',
          seconds: timeSpent[domain]
        }).catch(() => {});
      }
    });
  });
}

// Start tracking current tab
async function startTracking() {
  // Clear any existing interval
  if (trackingInterval) {
    clearInterval(trackingInterval);
  }
  
  // Get current active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) return;
  
  const tab = tabs[0];
  activeTabId = tab.id;
  const domain = getDomain(tab.url);
  
  if (!domain || !(await isTrackedDomain(domain))) {
    console.log('[Background] Not tracking:', domain);
    return;
  }
  
  console.log('[Background] Started tracking:', domain);
  startTime = Date.now();
  
  // Update every second
  trackingInterval = setInterval(async () => {
    const currentTab = await chrome.tabs.get(activeTabId).catch(() => null);
    if (!currentTab || !currentTab.active) {
      clearInterval(trackingInterval);
      return;
    }
    
    const currentDomain = getDomain(currentTab.url);
    if (currentDomain && await isTrackedDomain(currentDomain)) {
      await updateTimeSpent(currentDomain, 1);
    }
  }, 1000); // Update every second
}

// Stop tracking
function stopTracking() {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
}

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  stopTracking();
  await startTracking();
});

// Track URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    stopTracking();
    await startTracking();
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTracking();
  } else {
    await startTracking();
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  await checkDailyReset();
  await startTracking();
});

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  await checkDailyReset();
  await startTracking();
});

// Initialize immediately
checkDailyReset();
startTracking();
