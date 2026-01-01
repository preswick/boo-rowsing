# Mindful Browsing

A browser extension that helps you manage your time on distracting websites by gradually overlaying a custom image as you spend more time on tracked domains.

## Features

- 🎯 **Track specific domains** - Add websites you want to monitor
- 📊 **Time-based overlay** - Image opacity gradually increases based on time spent
- 🖼️ **Custom overlay image** - Use any image you want as the overlay
- 📈 **Usage statistics** - View how much time you've spent on each domain today
- 🔄 **Daily reset** - Statistics automatically reset each day

## How It Works

The extension tracks the time you spend on configured domains. As you browse, a custom overlay image gradually becomes more opaque:
- Starts at 0% opacity
- Reaches 100% opacity after 60 minutes
- At 100% opacity, the overlay blocks all interaction with the page

This provides a visual reminder to take breaks from distracting websites.

## Installation

### Chrome/Edge/Brave

1. Clone this repository or download as ZIP
2. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/` for Edge)
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the `boo-rowsing` folder
6. The extension is now installed!

## Usage

### Initial Setup

1. Click the extension icon in your browser toolbar
2. Click "Open Settings" to configure the extension

### Configure Tracked Domains

1. Go to Settings (via popup or right-click extension icon → Options)
2. In the "Tracked Domains" section, enter domains (one per line)
   - Examples: `x.com`, `twitter.com`, `reddit.com`, `facebook.com`
   - You can use full domains or partial matches
3. Click "💾 SAVE SETTINGS"

### Set Overlay Image

1. In Settings, go to "Overlay Image" section
2. Click "Choose an image" and select your image file
3. The image preview will show your selected image
4. Click "💾 SAVE SETTINGS"

### View Statistics

- Open the extension popup to see time spent on the current site
- Go to Settings → "Usage Statistics" to see all tracked domains
- Statistics reset automatically each day

### Reset Statistics

If you want to reset today's statistics manually:
1. Go to Settings
2. Click "Reset Today's Stats" button
3. Confirm the action

## Files Structure

```
boo-rowsing/
├── manifest.json      # Extension configuration
├── background.js      # Service worker for time tracking
├── content.js         # Content script that manages overlay
├── overlay.css        # Styles for the overlay
├── popup.html         # Extension popup interface
├── popup.js           # Popup logic
├── options.html       # Settings page
├── options.js         # Settings page logic
└── icon*.png          # Extension icons
```

## Development

This extension uses Manifest V3 and requires:
- Chrome 88+ / Edge 88+ / Brave (Chromium-based browsers)

To modify the extension:
1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

