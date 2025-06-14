
// Enhanced content script for CandidAI - Real-time meeting integration
(function() {
  'use strict';
  
  let candidaiActive = false;
  let currentPlatform = null;
  let observer = null;
  let audioService = null;
  let overlayService = null;
  let aiService = null;
  let questionQueue = [];
  let isProcessingQuestion = false;
  
  // Import services (these would be injected)
  const SERVICES_LOADED = {
    audio: false,
    overlay: false,
    ai: false
  };
  
  // Platform configurations
  const PLATFORMS = {
    'google-meet': {
      domain: 'meet.google.com',
      selectors: {
        videoContainer: '[data-allocation-index]',
        participantList: '[data-participant-id]',
        chatButton: '[data-tooltip*="chat" i]',
        micButton: '[data-tooltip*="microphone" i]'
      },
      position: { top: '20px', right: '20px' }
    },
    'microsoft-teams': {
      domain: 'teams.microsoft.com',
      selectors: {
        videoContainer: '[data-tid="meeting-canvas"]',
        participantList: '[data-tid="roster-content"]',
        chatButton: '[data-tid="toggle-chat"]',
        micButton: '[data-tid="microphone-button"]'
      },
      position: { top: '20px', right: '80px' }
    },
    'zoom': {
      domain: 'zoom.us',
      selectors: {
        videoContainer: '#video-preview',
        participantList: '.participants-ul',
        chatButton: '.footer-button__chat',
        micButton: '.footer-button__microphone'
      },
      position: { top: '20px', right: '20px' }
    }
  };
  
  function detectPlatform() {
    const url = window.location.href;
    
    for (const [key, config] of Object.entries(PLATFORMS)) {
      if (url.includes(config.domain)) {
        return key;
      }
    }
    
    return null;
  }
  
  function createCandidAIController(platform) {
    const config = PLATFORMS[platform];
    const position = config.position;
    
    const controller = document.createElement('div');
    controller.id = 'candidai-controller';
    controller.setAttribute('data-platform', platform);
    
    controller.innerHTML = `
      <div id="candidai-main-button" style="
        position: fixed;
        top: ${position.top};
        right: ${position.right};
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ec4899, #f43f5e);
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        cursor: pointer;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        transition: all 0.3s ease;
        border: 2px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
      " 
      onmouseover="this.style.transform='scale(1.1)'" 
      onmouseout="this.style.transform='scale(1)'"
      title="CandidAI Meeting Assistant">
        🎯
      </div>
      
      <div id="candidai-control-panel" style="
        position: fixed;
        top: ${parseInt(position.top) + 70}px;
        right: ${position.right};
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(16px);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 2147483646;
        display: none;
        min-width: 200px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-weight: 600; color: #1a1a1a;">CandidAI Assistant</span>
          <div id="candidai-status-indicator" style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ef4444;
          "></div>
        </div>
        
        <button id="candidai-toggle-btn" style="
          width: 100%;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          color: white;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 8px;
          transition: all 0.2s;
        ">
          Start Listening
        </button>
        
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <button id="candidai-overlay-style" style="
            flex: 1;
            padding: 6px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: white;
            font-size: 12px;
            cursor: pointer;
          ">
            Subtitle
          </button>
          <button id="candidai-settings" style="
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: white;
            cursor: pointer;
          ">
            ⚙️
          </button>
        </div>
        
        <div id="candidai-stats" style="
          font-size: 11px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
        ">
          <div>Questions: <span id="questions-count">0</span></div>
          <div>Suggestions: <span id="suggestions-count">0</span></div>
        </div>
      </div>
    `;
    
    return controller;
  }
  
  function initializeServices() {
    // Initialize overlay service
    if (typeof overlayService === 'undefined') {
      // Create a simple overlay service for the content script
      window.candidaiOverlayService = {
        showSuggestion: function(suggestion) {
          showOverlaySuggestion(suggestion);
        },
        updateConfig: function(config) {
          // Update overlay configuration
        }
      };
      overlayService = window.candidaiOverlayService;
      SERVICES_LOADED.overlay = true;
    }
    
    // Initialize AI service communication
    if (typeof aiService === 'undefined') {
      window.candidaiAIService = {
        generateSuggestion: function(context, questionType, framework) {
          return generateAISuggestion(context, questionType, framework);
        }
      };
      aiService = window.candidaiAIService;
      SERVICES_LOADED.ai = true;
    }
    
    // Initialize audio service
    if (typeof audioService === 'undefined') {
      window.candidaiAudioService = {
        startCapturing: function(config) {
          return startAudioCapture(config);
        },
        stopCapturing: function() {
          stopAudioCapture();
        },
        isActive: function() {
          return candidaiActive;
        }
      };
      audioService = window.candidaiAudioService;
      SERVICES_LOADED.audio = true;
    }
  }
  
  function showOverlaySuggestion(suggestion) {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'candidai-suggestion-overlay';
    overlay.id = `candidai-overlay-${suggestion.id}`;
    
    const overlayStyle = document.getElementById('candidai-overlay-style');
    const style = overlayStyle ? overlayStyle.textContent.toLowerCase() : 'subtitle';
    
    if (style === 'subtitle') {
      overlay.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 16px;
        font-weight: 500;
        max-width: 80%;
        text-align: center;
        z-index: 2147483647;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        animation: candidai-fade-in 0.3s ease-out;
      `;
    } else {
      overlay.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.95), rgba(244, 63, 94, 0.95));
        color: white;
        padding: 16px;
        border-radius: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        z-index: 2147483647;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(16px);
        animation: candidai-slide-in 0.3s ease-out;
      `;
    }
    
    overlay.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 12px; opacity: 0.8;">💡 AI Suggestion</span>
        <button onclick="this.closest('.candidai-suggestion-overlay').remove()" style="
          background: none; 
          border: none; 
          color: inherit; 
          cursor: pointer; 
          opacity: 0.7;
          padding: 2px 6px;
          border-radius: 4px;
        ">✕</button>
      </div>
      <div style="margin-bottom: 8px; line-height: 1.4;">
        ${suggestion.text}
      </div>
      <div style="font-size: 11px; opacity: 0.7; display: flex; justify-content: space-between;">
        <span>${suggestion.framework || 'General'}</span>
        <span>${suggestion.confidence}% confidence</span>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.style.animation = 'candidai-fade-out 0.3s ease-in';
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.remove();
          }
        }, 300);
      }
    }, 8000);
    
    // Update suggestions count
    const suggestionsCount = document.getElementById('suggestions-count');
    if (suggestionsCount) {
      const current = parseInt(suggestionsCount.textContent) || 0;
      suggestionsCount.textContent = current + 1;
    }
  }
  
  function injectAnimationStyles() {
    const styleId = 'candidai-animations';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes candidai-fade-in {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      
      @keyframes candidai-slide-in {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes candidai-fade-out {
        from { opacity: 1; }
        to { opacity: 0; transform: translateY(-10px); }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  async function startAudioCapture(config) {
    try {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        
        if (finalTranscript) {
          processTranscript(finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        config.onError(event.error);
      };
      
      recognition.onend = () => {
        if (candidaiActive) {
          // Auto-restart
          setTimeout(() => recognition.start(), 100);
        }
      };
      
      recognition.start();
      window.candidaiRecognition = recognition;
      
      config.onStatusChange('capturing');
      return true;
    } catch (error) {
      config.onError(error.message);
      return false;
    }
  }
  
  function stopAudioCapture() {
    if (window.candidaiRecognition) {
      window.candidaiRecognition.stop();
      window.candidaiRecognition = null;
    }
  }
  
  function processTranscript(transcript) {
    console.log('Processing transcript:', transcript);
    
    // Detect if this is a question
    const isQuestion = detectQuestion(transcript);
    
    if (isQuestion && !isProcessingQuestion) {
      isProcessingQuestion = true;
      
      // Update questions count
      const questionsCount = document.getElementById('questions-count');
      if (questionsCount) {
        const current = parseInt(questionsCount.textContent) || 0;
        questionsCount.textContent = current + 1;
      }
      
      // Add to queue and process
      questionQueue.push({
        text: transcript,
        timestamp: Date.now(),
        type: classifyQuestion(transcript)
      });
      
      // Generate AI response
      generateAndShowSuggestion(transcript);
      
      setTimeout(() => {
        isProcessingQuestion = false;
      }, 2000); // Prevent spam
    }
  }
  
  function detectQuestion(transcript) {
    const questionPatterns = [
      /\b(what|how|why|when|where|who|can you|could you|would you|tell me|describe|explain)\b/i,
      /\?$/,
      /\b(experience with|worked on|familiar with|knowledge of)\b/i,
      /\b(challenging|difficult|problem|issue|obstacle)\b/i
    ];
    
    return questionPatterns.some(pattern => pattern.test(transcript));
  }
  
  function classifyQuestion(transcript) {
    const text = transcript.toLowerCase();
    
    if (text.includes('tell me about a time') || text.includes('describe a situation') || 
        text.includes('give me an example') || text.includes('challenging')) {
      return 'behavioral';
    }
    
    if (text.includes('technical') || text.includes('code') || text.includes('algorithm') ||
        text.includes('programming') || text.includes('technology')) {
      return 'technical';
    }
    
    if (text.includes('what would you do') || text.includes('how would you handle')) {
      return 'situational';
    }
    
    return 'general';
  }
  
  async function generateAndShowSuggestion(transcript) {
    try {
      // Send to background script for AI processing
      if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'generateSuggestion',
          context: transcript,
          questionType: classifyQuestion(transcript),
          framework: 'star'
        }, (response) => {
          if (response && response.suggestion) {
            const suggestion = {
              id: Date.now().toString(),
              text: response.suggestion,
              type: 'answer',
              priority: 'high',
              framework: response.framework,
              confidence: response.confidence || 85
            };
            
            overlayService.showSuggestion(suggestion);
          }
        });
      } else {
        // Fallback suggestion
        const fallbackSuggestion = {
          id: Date.now().toString(),
          text: 'Consider using the STAR method: describe the Situation, Task, Action, and Result from your experience.',
          type: 'tip',
          priority: 'medium',
          framework: 'STAR',
          confidence: 70
        };
        
        overlayService.showSuggestion(fallbackSuggestion);
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    }
  }
  
  function setupControlPanel(controller) {
    const mainButton = controller.querySelector('#candidai-main-button');
    const controlPanel = controller.querySelector('#candidai-control-panel');
    const toggleBtn = controller.querySelector('#candidai-toggle-btn');
    const statusIndicator = controller.querySelector('#candidai-status-indicator');
    const overlayStyleBtn = controller.querySelector('#candidai-overlay-style');
    
    // Toggle control panel
    mainButton.addEventListener('click', () => {
      const isVisible = controlPanel.style.display !== 'none';
      controlPanel.style.display = isVisible ? 'none' : 'block';
    });
    
    // Toggle listening
    toggleBtn.addEventListener('click', async () => {
      if (!candidaiActive) {
        candidaiActive = true;
        const success = await audioService.startCapturing({
          onTranscript: (analysis) => {
            // Handle transcript
          },
          onError: (error) => {
            console.error('Audio capture error:', error);
            candidaiActive = false;
            updateUI();
          },
          onStatusChange: (status) => {
            updateUI();
          }
        });
        
        if (success) {
          statusIndicator.style.background = '#10b981';
          toggleBtn.textContent = 'Stop Listening';
          toggleBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }
      } else {
        candidaiActive = false;
        audioService.stopCapturing();
        statusIndicator.style.background = '#ef4444';
        toggleBtn.textContent = 'Start Listening';
        toggleBtn.style.background = 'linear-gradient(135deg, #ec4899, #f43f5e)';
      }
    });
    
    // Toggle overlay style
    overlayStyleBtn.addEventListener('click', () => {
      const current = overlayStyleBtn.textContent;
      const newStyle = current === 'Subtitle' ? 'Popup' : 'Subtitle';
      overlayStyleBtn.textContent = newStyle;
      
      overlayService.updateConfig({
        style: newStyle.toLowerCase()
      });
    });
    
    function updateUI() {
      // Update UI based on current state
    }
  }
  
  function injectCandidAI() {
    const platform = detectPlatform();
    if (!platform || document.getElementById('candidai-controller')) return;
    
    console.log(`CandidAI injecting enhanced integration for ${platform}`);
    
    // Initialize services
    initializeServices();
    
    // Inject animation styles
    injectAnimationStyles();
    
    // Create and inject controller
    const controller = createCandidAIController(platform);
    document.body.appendChild(controller);
    
    // Setup control panel functionality
    setupControlPanel(controller);
    
    currentPlatform = platform;
    console.log(`CandidAI enhanced integration active for ${platform}`);
    
    // Notify background script
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'enhancedWidgetInjected',
        platform: platform,
        features: ['audio-capture', 'overlay-system', 'question-detection'],
        timestamp: Date.now()
      });
    }
  }
  
  // Auto-inject when page loads
  function init() {
    const platform = detectPlatform();
    if (platform) {
      console.log(`CandidAI detected platform: ${platform} - initializing enhanced features`);
      setTimeout(injectCandidAI, 1000);
    }
  }
  
  // Handle navigation in SPAs
  let lastUrl = location.href;
  const navigationObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('Navigation detected, re-initializing CandidAI');
      
      // Clean up existing
      const existing = document.getElementById('candidai-controller');
      if (existing) {
        existing.remove();
      }
      
      setTimeout(init, 1000);
    }
  });
  
  navigationObserver.observe(document, { 
    subtree: true, 
    childList: true 
  });
  
  // Listen for messages from background script
  if (chrome && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleEnhancedWidget') {
        const controller = document.getElementById('candidai-controller');
        if (controller) {
          const panel = controller.querySelector('#candidai-control-panel');
          panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        sendResponse({ success: true });
      }
      
      if (request.action === 'getEnhancedPageInfo') {
        sendResponse({
          platform: currentPlatform,
          url: window.location.href,
          title: document.title,
          active: candidaiActive,
          features: SERVICES_LOADED
        });
      }
    });
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  console.log('CandidAI enhanced content script loaded with real-time features');
})();
