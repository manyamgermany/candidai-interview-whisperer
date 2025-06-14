
// Enhanced content script for CandidAI - injected into meeting platforms
(function() {
  'use strict';
  
  let candidaiInjected = false;
  let currentPlatform = null;
  let observer = null;
  
  // Platform-specific configurations
  const PLATFORMS = {
    'google-meet': {
      domain: 'meet.google.com',
      selectors: {
        videoContainer: '[data-allocation-index]',
        participantList: '[data-participant-id]',
        chatButton: '[data-tooltip*="chat" i]'
      },
      position: { top: '20px', right: '20px' }
    },
    'microsoft-teams': {
      domain: 'teams.microsoft.com',
      selectors: {
        videoContainer: '[data-tid="meeting-canvas"]',
        participantList: '[data-tid="roster-content"]',
        chatButton: '[data-tid="toggle-chat"]'
      },
      position: { top: '20px', right: '80px' }
    },
    'zoom': {
      domain: 'zoom.us',
      selectors: {
        videoContainer: '#video-preview',
        participantList: '.participants-ul',
        chatButton: '.footer-button__chat'
      },
      position: { top: '20px', right: '20px' }
    },
    'linkedin': {
      domain: 'linkedin.com',
      selectors: {
        messageContainer: '.msg-thread',
        profileSection: '.pv-top-card'
      },
      position: { top: '80px', right: '20px' }
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
  
  function createCandidAIWidget(platform) {
    const config = PLATFORMS[platform];
    const position = config.position;
    
    const widget = document.createElement('div');
    widget.id = 'candidai-widget';
    widget.setAttribute('data-platform', platform);
    
    widget.innerHTML = `
      <div id="candidai-button" style="
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
      onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(236, 72, 153, 0.4)'" 
      onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(236, 72, 153, 0.3)'"
      title="Open CandidAI Assistant">
        🎯
      </div>
      
      <div id="candidai-status" style="
        position: fixed;
        top: ${parseInt(position.top) + 70}px;
        right: ${position.right};
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483646;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        backdrop-filter: blur(10px);
      ">
        Ready
      </div>
    `;
    
    // Add click handler for main button
    const button = widget.querySelector('#candidai-button');
    const status = widget.querySelector('#candidai-status');
    
    button.addEventListener('click', () => {
      console.log('CandidAI widget clicked');
      
      // Send message to background script to open dashboard
      if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ 
          action: 'openDashboard',
          platform: platform,
          url: window.location.href 
        });
      }
      
      // Visual feedback
      button.style.background = 'linear-gradient(135deg, #f43f5e, #ec4899)';
      setTimeout(() => {
        button.style.background = 'linear-gradient(135deg, #ec4899, #f43f5e)';
      }, 200);
    });
    
    // Show status on hover
    button.addEventListener('mouseenter', () => {
      status.style.opacity = '1';
    });
    
    button.addEventListener('mouseleave', () => {
      status.style.opacity = '0';
    });
    
    return widget;
  }
  
  function injectCandidAI() {
    if (candidaiInjected) return;
    
    const platform = detectPlatform();
    if (!platform) return;
    
    console.log(`CandidAI injecting into ${platform}`);
    
    const widget = createCandidAIWidget(platform);
    document.body.appendChild(widget);
    
    candidaiInjected = true;
    currentPlatform = platform;
    
    // Notify background script of successful injection
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'widgetInjected',
        platform: platform,
        timestamp: Date.now()
      });
    }
    
    console.log(`CandidAI widget injected for ${platform}`);
    
    // Set up platform-specific observers
    setupPlatformObservers(platform);
  }
  
  function setupPlatformObservers(platform) {
    const config = PLATFORMS[platform];
    if (!config) return;
    
    // Clean up existing observer
    if (observer) {
      observer.disconnect();
    }
    
    // Create new observer for dynamic content
    observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        // Check if important elements were added/removed
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for video elements, participant changes, etc.
              const element = node;
              if (element.matches && (
                element.matches('video') ||
                element.matches('[data-participant-id]') ||
                element.matches('.participant') ||
                element.matches('[data-allocation-index]')
              )) {
                shouldUpdate = true;
              }
            }
          });
        }
      });
      
      if (shouldUpdate) {
        console.log(`Platform content changed in ${platform}`);
        // Could trigger updates to widget position or functionality
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }
  
  function removeCandidAI() {
    const widget = document.getElementById('candidai-widget');
    if (widget) {
      widget.remove();
      candidaiInjected = false;
      currentPlatform = null;
      
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      
      console.log('CandidAI widget removed');
    }
  }
  
  function updateWidgetVisibility() {
    const widget = document.getElementById('candidai-widget');
    if (!widget) return;
    
    // Hide widget if user is sharing screen or in certain states
    const isScreenSharing = document.querySelector('[data-is-screen-share="true"]') !== null;
    const isPresentationMode = document.querySelector('.presentation-mode') !== null;
    
    if (isScreenSharing || isPresentationMode) {
      widget.style.opacity = '0.3';
      widget.style.pointerEvents = 'none';
    } else {
      widget.style.opacity = '1';
      widget.style.pointerEvents = 'auto';
    }
  }
  
  // Initialize when page loads
  function init() {
    const platform = detectPlatform();
    if (platform) {
      console.log(`CandidAI detected platform: ${platform}`);
      // Delay injection to ensure page is fully loaded
      setTimeout(() => {
        injectCandidAI();
        // Set up periodic visibility updates
        setInterval(updateWidgetVisibility, 2000);
      }, 2000);
    }
  }
  
  // Handle navigation in SPAs
  let lastUrl = location.href;
  const navigationObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('Navigation detected:', url);
      
      // Remove existing widget
      removeCandidAI();
      
      // Re-initialize after navigation
      setTimeout(init, 1000);
    }
  });
  
  // Start navigation observer
  navigationObserver.observe(document, { 
    subtree: true, 
    childList: true 
  });
  
  // Listen for messages from extension
  if (chrome && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleWidget') {
        const widget = document.getElementById('candidai-widget');
        if (widget) {
          widget.style.display = widget.style.display === 'none' ? 'block' : 'none';
        }
        sendResponse({ success: true });
      }
      
      if (request.action === 'getPageInfo') {
        sendResponse({
          platform: currentPlatform,
          url: window.location.href,
          title: document.title,
          injected: candidaiInjected
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
  
  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden - could pause certain activities
      console.log('Page hidden - pausing CandidAI activities');
    } else {
      // Page is visible - resume activities
      console.log('Page visible - resuming CandidAI activities');
      updateWidgetVisibility();
    }
  });
  
  console.log('CandidAI content script loaded');
})();
