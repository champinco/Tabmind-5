# TabMind - Intelligent Workspace Manager

Transform tab chaos into organized clarity with AI-powered workspace management.

## 🎯 Overview

TabMind is a Chrome extension that uses Chrome's built-in AI (Gemini Nano) to automatically analyze and organize your browser tabs into intelligent workspaces. Say goodbye to tab overload and hello to productivity.

## ✨ Features

- **AI-Powered Clustering**: Automatically groups related tabs using Chrome's Prompt API
- **Smart Summaries**: Generates concise summaries using the Summarizer API
- **One-Click Organization**: Apply AI-generated clusters as Chrome tab groups
- **Real-Time Analysis**: Monitors tab changes and updates clusters automatically
- **Privacy-First**: All processing happens locally on your device
- **Zero Configuration**: Works immediately after installation

## 🚀 Installation

### From Source

1. Clone this repository:
   \`\`\`bash
   git clone https://github.com/yourusername/tabmind.git
   cd tabmind
   \`\`\`

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the extension directory

5. The TabMind icon should appear in your extensions toolbar

### Requirements

- Chrome 138+ (for stable Summarizer API)
- Windows 10/11, macOS 13+, or Linux
- At least 22 GB free storage
- GPU with >4GB VRAM or 16GB+ RAM with 4+ CPU cores
- Unmetered network connection (for initial model download)

## 📖 Usage

1. **Open the Side Panel**: Click the TabMind icon in your toolbar

2. **Let AI Analyze**: TabMind automatically analyzes your open tabs

3. **Review Clusters**: See intelligent groupings in the side panel

4. **Apply Groups**: Click "Apply Tab Groups" to organize your tabs

5. **Revert Anytime**: Use "Revert Tabs" to undo grouping

## 🤖 Chrome Built-in AI APIs Used

### Prompt API
- Analyzes tab relationships and generates intelligent clusters
- Creates semantic groupings based on content, not just domains

### Summarizer API
- Generates concise summaries of page content
- Enhances clustering accuracy with content understanding

### Fallback Strategy
- Domain-based clustering when AI is unavailable
- Ensures functionality across all devices

## 🏗️ Architecture

\`\`\`
TabMind Extension
├── background.js       # Service worker, AI analysis, state management
├── sidepanel.html      # User interface
├── sidepanel.js        # UI logic and interactions
├── content.js          # Page metadata extraction
├── styles.css          # Modern dark theme
└── manifest.json       # Extension configuration
\`\`\`

## 🎨 Design Philosophy

- **Dark-First**: Reduces eye strain during extended use
- **Minimal Interaction**: Automatic analysis, one-click actions
- **Progressive Disclosure**: Expandable clusters for detail on demand
- **Privacy-Preserving**: All AI processing happens on-device

## 🔧 Development

### Project Structure

\`\`\`
tabmind/
├── icons/              # Extension icons
├── background.js       # Background service worker
├── sidepanel.html      # Side panel UI
├── sidepanel.js        # Side panel logic
├── content.js          # Content script
├── styles.css          # Styles
├── manifest.json       # Extension manifest
└── README.md          # This file
\`\`\`

### Testing

1. Open 10-20 tabs across different topics
2. Click the TabMind icon
3. Verify clusters are generated
4. Test "Apply Tab Groups" functionality
5. Test "Revert Tabs" functionality

### Debugging

- Check `chrome://extensions/` for errors
- View console logs in the service worker
- Inspect side panel with DevTools

## 🐛 Known Issues

- AI model download requires user interaction on first use
- Some tabs may not be accessible for content extraction (chrome://, file://)
- Tab groups are window-specific

## 🚀 Future Enhancements

- Cross-device workspace sync
- Workspace templates and presets
- Predictive tab loading
- Multi-language support
- Collaborative workspaces

## 📝 License

MIT License - see LICENSE file for details

## 🏆 Chrome Built-in AI Challenge 2025

This extension was built for the Chrome Built-in AI Challenge 2025, showcasing the power of on-device AI for productivity enhancement.

## 📧 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

Built with ❤️ using Chrome's built-in AI
