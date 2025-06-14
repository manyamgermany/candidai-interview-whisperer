
// Content script for CandidAI - injected into meeting platforms
(function() {
  'use strict';
  
  let candidaiInjected = false;
  
  function injectCandidAI() {
    if (candidaiInjected) return;
    
    // Create floating CandidAI widget
    const widget = document.createElement('div');
    widget.id = 'candidai-widget';
    widget.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ec4899, #f43f5e);
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        🎯
      </div>
    `;
    
    widget.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openDashboard' });
    });
    
    document.body.appendChild(widget);
    candidaiInjected = true;
    
    console.log('CandidAI widget injected');
  }
  
  // Detect platform and inject accordingly
  function detectPlatform() {
    const url = window.location.href;
    
    if (url.includes('meet.google.com')) {
      return 'google-meet';
    } else if (url.includes('teams.microsoft.com')) {
      return 'microsoft-teams';
    } else if (url.includes('zoom.us')) {
      return 'zoom';
    } else if (url.includes('linkedin.com')) {
      return 'linkedin';
    }
    
    return null;
  }
  
  // Initialize when page loads
  function init() {
    const platform = detectPlatform();
    if (platform) {
      console.log(`CandidAI detected platform: ${platform}`);
      setTimeout(injectCandidAI, 2000); // Delay to ensure page is loaded
    }
  }
  
  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Handle navigation in SPAs
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      candidaiInjected = false;
      setTimeout(init, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
})();
