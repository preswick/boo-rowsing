// options.js

// Load current settings
async function loadSettings() {
    const data = await chrome.storage.local.get([
      'trackedDomains',
      'overlayImage',
      'timeSpent'
    ]);
    
    // Load domains
    const domains = data.trackedDomains || [];
    document.getElementById('domains').value = domains.join('\n');
    
    // Load image preview
    if (data.overlayImage) {
      const preview = document.getElementById('image-preview');
      preview.src = data.overlayImage;
      preview.classList.add('show');
      document.getElementById('current-image-status').innerHTML = 
        '<small style="color: green;">✓ Image loaded</small>';
    }
    
    // Load stats
    displayStats(data.timeSpent || {});
  }
  
  // Display usage statistics
  function displayStats(timeSpent) {
    const container = document.getElementById('stats-container');
    
    if (Object.keys(timeSpent).length === 0) {
      container.innerHTML = '<p>No usage data for today.</p>';
      return;
    }
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="border-bottom: 2px solid #ddd;"><th style="text-align: left; padding: 8px;">Domain</th><th style="text-align: right; padding: 8px;">Time</th><th style="text-align: right; padding: 8px;">Opacity</th></tr>';
    
    for (const [domain, seconds] of Object.entries(timeSpent)) {
      const minutes = Math.floor(seconds / 60);
      const opacity = Math.min(minutes / 60 * 100, 100).toFixed(1);
      html += `<tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${domain}</td>
        <td style="text-align: right; padding: 8px;">${minutes} min</td>
        <td style="text-align: right; padding: 8px;">${opacity}%</td>
      </tr>`;
    }
    
    html += '</table>';
    container.innerHTML = html;
  }
  
  // Handle image upload
  document.getElementById('image-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = document.getElementById('image-preview');
      preview.src = event.target.result;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  });
  
  // Save settings
  // Save settings
document.getElementById('save').addEventListener('click', async () => {
    const domainsText = document.getElementById('domains').value;
    const domains = domainsText
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);
    
    const saveData = {
      trackedDomains: domains
    };
    
    // Save image if new one was uploaded
    const imageInput = document.getElementById('image-upload');
    if (imageInput.files.length > 0) {
      const file = imageInput.files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        saveData.overlayImage = event.target.result;
        await chrome.storage.local.set(saveData);
        showStatus('Settings saved successfully!', 'success');
        // Reload to show updated stats
        setTimeout(() => loadSettings(), 500);
      };
      
      reader.onerror = () => {
        showStatus('Error reading image file', 'error');
      };
      
      reader.readAsDataURL(file);
    } else {
      // No new image, just save domains
      await chrome.storage.local.set(saveData);
      showStatus('Settings saved successfully!', 'success');
      // Reload to show updated stats
      setTimeout(() => loadSettings(), 500);
    }
  });
  
  // Reset statistics
  document.getElementById('reset-stats').addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset today\'s statistics?')) {
      await chrome.storage.local.set({
        timeSpent: {},
        lastReset: new Date().toDateString()
      });
      displayStats({});
      showStatus('Statistics reset successfully!', 'success');
    }
  });
  
  // Show status message
  function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    
    setTimeout(() => {
      status.className = 'status';
    }, 3000);
  }
  
  // Initialize
  loadSettings();
  