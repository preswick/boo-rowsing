// popup.js
async function displayCurrentSite() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url) return;
    
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    const data = await chrome.storage.local.get(['trackedDomains', 'timeSpent']);
    const trackedDomains = data.trackedDomains || [];
    const timeSpent = data.timeSpent || {};
    
    const isTracked = trackedDomains.some(d => 
      domain.includes(d) || d.includes(domain)
    );
    
    const container = document.getElementById('current-site');
    
    if (isTracked) {
      const seconds = timeSpent[domain] || 0;
      const minutes = Math.floor(seconds / 60);
      const opacity = Math.min(minutes / 60 * 100, 100).toFixed(1);
      
      container.innerHTML = `
        <div class="time-info">
          <div class="domain">${domain}</div>
          <div class="minutes">Time today: ${minutes} minutes</div>
          <div class="minutes">Overlay opacity: ${opacity}%</div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="time-info">
          Current site is not being tracked.
        </div>
      `;
    }
  }
  
  document.getElementById('open-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  displayCurrentSite();
  