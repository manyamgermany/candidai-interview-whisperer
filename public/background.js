
// Background service worker for CandidAI Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CandidAI extension installed');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ url: tabs[0]?.url, title: tabs[0]?.title });
    });
    return true;
  }
  
  if (request.action === 'openDashboard') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
});

// Monitor tab updates for supported platforms
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedPlatforms = [
      'meet.google.com',
      'teams.microsoft.com',
      'zoom.us',
      'linkedin.com'
    ];
    
    const isSupported = supportedPlatforms.some(platform => 
      tab.url.includes(platform)
    );
    
    if (isSupported) {
      chrome.action.setBadgeText({
        text: '●',
        tabId: tabId
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#ec4899',
        tabId: tabId
      });
    } else {
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});
