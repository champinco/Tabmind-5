# TabMind Chrome Extension - Installation Guide

## Prerequisites

To use TabMind's AI features, you need:

1. **Chrome Browser**: Version 138 or later (Canary, Dev, or Beta channel)
2. **Hardware Requirements**:
   - GPU with more than 4 GB VRAM, OR
   - CPU with 16 GB+ RAM and 4+ cores
   - At least 22 GB free storage space
3. **Operating System**: Windows 10/11, macOS 13+, or Linux

## Enable Chrome Built-in AI

### Step 1: Enable AI Features

1. Open Chrome and go to `chrome://flags`
2. Search for and enable these flags:
   - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
   - `#prompt-api-for-gemini-nano` → **Enabled**
   - `#summarization-api-for-gemini-nano` → **Enabled**
3. Relaunch Chrome

### Step 2: Verify AI Availability

1. Go to `chrome://on-device-internals`
2. Check that Gemini Nano is available or downloading
3. If needed, click "Download" to get the AI model (requires ~2GB download)

## Install TabMind Extension

### Method 1: Load Unpacked (Development)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the TabMind extension folder
6. The extension icon should appear in your toolbar

### Method 2: Install from ZIP

1. Download the extension ZIP file
2. Extract it to a permanent location (don't delete after installing)
3. Follow steps 2-6 from Method 1

## Using TabMind

1. Click the TabMind icon in your Chrome toolbar
2. The side panel will open showing your workspace analysis
3. Wait for AI to analyze your tabs (first time may take longer)
4. View your intelligent tab clusters
5. Click "Apply Tab Groups" to organize your tabs
6. Use "Revert Tabs" to restore original state

## Features

- **AI-Powered Clustering**: Automatically groups related tabs using Gemini Nano
- **Smart Summaries**: Generates concise descriptions for each cluster
- **Tab Groups**: Applies color-coded groups to your browser tabs
- **Workspace Stats**: See total tabs, clusters, and last analysis time
- **Revert Function**: Restore tabs to their original state

## Troubleshooting

### AI Not Working

1. Check `chrome://on-device-internals` to verify Gemini Nano is downloaded
2. Ensure you're using Chrome 138+ (check `chrome://version`)
3. Verify hardware requirements are met
4. Try restarting Chrome after enabling flags

### Extension Not Loading

1. Make sure Developer mode is enabled in `chrome://extensions`
2. Check the Console for error messages
3. Verify all extension files are present
4. Try removing and re-adding the extension

### Tabs Not Grouping

1. Ensure you have multiple tabs open
2. Click "Refresh Analysis" to re-analyze
3. Check that tab permissions are granted
4. Look for errors in the extension's service worker console

## Privacy & Security

- All AI processing happens **on-device** using Chrome's built-in Gemini Nano
- No data is sent to external servers
- Tab data is stored locally in Chrome storage
- Extension only accesses tabs you explicitly open

## Support

For issues or questions:
- Check the [Chrome AI Challenge documentation](https://developer.chrome.com/docs/ai/built-in)
- Review the SUBMISSION.md file for technical details
- Open an issue on the project repository

## License

See LICENSE file for details.
