
# CandidAI ✨ - Your AI-Powered Chrome Extension Meeting Assistant

<div align="center">
  <img src="public/favicon.ico" alt="CandidAI Logo" width="32" height="32">
  <p><em>Transform your meeting performance with real-time AI coaching and analytics</em></p>
</div>

---

## 🚀 Quick Start Guide

### Step 1: Install the Chrome Extension

1. **Enable Developer Mode in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" ON (top-right corner)

2. **Load the Extension**
   - Click "Load unpacked" button
   - Select the `dist` folder from this project (after building)
   - The CandidAI extension should now appear in your extensions list

3. **Build the Project First** (if you haven't already)
   ```bash
   npm install
   npm run build
   ```

### Step 2: Configure Your AI Settings

1. **Open the Extension**
   - Click the CandidAI icon in your Chrome toolbar
   - Or click "Launch Dashboard" to open the full interface

2. **Set Up AI Providers** (Go to Settings)
   - Configure OpenAI API key for advanced suggestions
   - Set up Anthropic or Google AI (optional)
   - Test your connection to ensure it's working

### Step 3: Start Your First Session

1. **Join a Supported Meeting Platform**
   - Google Meet (`meet.google.com`)
   - Microsoft Teams (`teams.microsoft.com`) 
   - Zoom (`zoom.us`)
   - LinkedIn (`linkedin.com`)

2. **Activate CandidAI**
   - Look for the 🎯 floating button on your meeting screen
   - Click it to open the control panel
   - Press "Start Listening" to begin AI coaching

3. **Get Real-Time Feedback**
   - Grant microphone permissions when prompted
   - Speak naturally - AI will detect questions and provide suggestions
   - View real-time analytics and coaching tips

---

## ✨ Complete Feature List

### 🎙️ **Real-Time Audio & Speech Analysis**
- **Live Transcription**: Real-time speech-to-text conversion
- **Question Detection**: Automatically identifies when you're being asked questions
- **Speech Analytics**: Track words per minute, filler words, confidence levels
- **Speaking Pace Analysis**: Get feedback on your delivery speed and rhythm

### 🧠 **AI-Powered Intelligent Suggestions**
- **Multiple AI Providers**: OpenAI, Anthropic, Google AI integration
- **Framework-Based Responses**: STAR, PREP, SOAR method suggestions
- **Context-Aware Tips**: Suggestions based on question type and content
- **Behavioral vs Technical**: Different coaching for different question types

### 📊 **Advanced Performance Analytics**
- **Real-Time Metrics**: Live WPM, confidence scores, filler word tracking
- **Session Reports**: Detailed post-meeting performance analysis
- **Progress Tracking**: Monitor improvement over time
- **Confidence Scoring**: AI-calculated confidence levels

### 📄 **Document Intelligence & Analysis**
- **Resume Upload**: PDF/DOCX resume analysis and skill extraction
- **Key Skills Identification**: Automatic detection of technical and soft skills
- **Interview Preparation**: Personalized coaching based on your background
- **Document Library**: Store and manage multiple documents

### 📸 **Screenshot & Visual Analysis**
- **Screen Capture**: Analyze content visible during meetings
- **Context Detection**: Identify interview setups, presentations, shared screens
- **Visual Insights**: AI suggestions based on what's visible on screen
- **Meeting Platform Recognition**: Automatic detection of meeting environments

### 💬 **Interactive AI Chat Assistant**
- **Real-Time Chat**: Ask questions and get instant AI responses during sessions
- **Contextual Help**: Get specific advice based on current conversation
- **Practice Mode**: Chat with AI to practice responses before interviews
- **Multi-Provider Support**: Switch between different AI models

### 🎯 **Chrome Extension Integration**
- **Seamless Injection**: Automatically works on supported platforms
- **Floating Controls**: Unobtrusive interface that doesn't interfere with meetings
- **Permission Management**: Secure access to microphone and screen sharing
- **Cross-Platform**: Works across Google Meet, Teams, Zoom, and LinkedIn

### 📈 **Session Management & History**
- **Session Recording**: Keep track of all your meeting sessions
- **Performance Trends**: View improvement over time with charts and graphs
- **Detailed Reports**: Export comprehensive performance reports
- **Session Replay**: Review key moments and feedback from past sessions

### ⚙️ **Advanced Configuration & Settings**
- **AI Provider Configuration**: Set up and test multiple AI services
- **Response Customization**: Adjust suggestion types and frameworks
- **Privacy Controls**: Manage data storage and sharing preferences
- **Overlay Customization**: Choose between subtitle and popup suggestion styles

### 🔄 **Real-Time Coaching Features**
- **Live Feedback**: Instant suggestions as you speak
- **Question Classification**: Automatic detection of behavioral vs technical questions
- **Framework Recommendations**: Suggests best response structures (STAR, etc.)
- **Confidence Boosters**: Real-time encouragement and improvement tips

---

## 🛠️ Development Setup

Want to customize or contribute? Here's how to set up the development environment:

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for Chrome extension
npm run build

# Run tests
npm test
```

### 🏗️ Project Structure
```
├── public/                 # Chrome extension files
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Service worker
│   └── content-script.js  # Content injection
├── src/
│   ├── components/        # React components
│   ├── services/          # AI and audio services
│   ├── hooks/             # Custom React hooks
│   └── pages/             # Application pages
└── dist/                  # Built extension (load this in Chrome)
```

---

## 🔧 Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **AI Integration**: OpenAI, Anthropic, Google AI APIs
- **Audio Processing**: Web Speech API, WebRTC
- **Chrome Extension**: Manifest V3, Service Workers
- **Data Visualization**: Recharts for analytics
- **State Management**: Zustand + React Query

---

## 📋 Supported Platforms

| Platform | URL Pattern | Features Available |
|----------|------------|-------------------|
| 🎥 **Google Meet** | `meet.google.com/*` | ✅ Full integration |
| 💼 **Microsoft Teams** | `teams.microsoft.com/*` | ✅ Full integration |
| 🔍 **Zoom** | `zoom.us/*` | ✅ Full integration |
| 💼 **LinkedIn** | `linkedin.com/*` | ✅ Full integration |

---

## 🔒 Privacy & Security

- **Local Processing**: Speech analysis happens locally when possible
- **Secure Storage**: All data encrypted and stored locally
- **No Persistent Recording**: Audio is processed in real-time, not stored
- **Optional Cloud AI**: Choose which AI providers to use
- **GDPR Compliant**: Full control over your data

---

## 🆘 Troubleshooting

### Common Issues:

**Extension Not Loading?**
- Ensure Developer Mode is enabled in Chrome
- Check that you're loading the `dist` folder, not the root project
- Try refreshing the extension and reloading the page

**Microphone Not Working?**
- Grant microphone permissions when prompted
- Check Chrome's site permissions for the meeting platform
- Ensure no other applications are using your microphone

**AI Suggestions Not Appearing?**
- Configure your AI provider in Settings
- Check your API keys are valid and have credits
- Ensure you're on a supported meeting platform

**Performance Issues?**
- Close unnecessary browser tabs
- Check if other extensions are conflicting
- Ensure stable internet connection for AI features

---

## 📞 Support & Community

- 📧 **Support**: [Create an issue](https://github.com/your-repo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📚 **Documentation**: [Full Docs](https://docs.candidai.com)
- 🎥 **Tutorials**: [YouTube Channel](https://youtube.com/candidai)

---

<div align="center">
  <p><strong>Ready to ace your next meeting? Install CandidAI and experience the future of meeting assistance! 🚀</strong></p>
  
  <p>⭐ <strong>Like CandidAI? Give us a star on GitHub!</strong> ⭐</p>
</div>
