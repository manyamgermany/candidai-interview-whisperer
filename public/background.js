
// CandidAI Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('CandidAI Extension installed');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'enhancedWidgetInjected':
      console.log(`CandidAI widget injected on ${request.platform}`);
      sendResponse({ success: true });
      break;
      
    case 'toggleEnhancedWidget':
      // Forward to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, request);
        }
      });
      break;
      
    case 'generateSuggestion':
      // Handle AI suggestion generation
      handleAISuggestion(request, sendResponse);
      return true; // Keep message channel open for async response
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle AI suggestion generation
async function handleAISuggestion(request, sendResponse) {
  try {
    // This would integrate with your AI services
    // For now, return a mock response based on question type
    const suggestion = generateMockSuggestion(request.questionType, request.context);
    
    sendResponse({
      suggestion: suggestion.text,
      framework: suggestion.framework,
      confidence: suggestion.confidence
    });
  } catch (error) {
    sendResponse({
      error: 'Failed to generate AI suggestion'
    });
  }
}

function generateMockSuggestion(questionType, context) {
  const suggestions = {
    behavioral: {
      text: "Use the STAR method: describe a specific Situation, the Task you needed to accomplish, the Actions you took, and the Results you achieved.",
      framework: "STAR",
      confidence: 85
    },
    technical: {
      text: "Break down the problem into smaller components, explain your approach step-by-step, and mention any trade-offs you would consider.",
      framework: "Problem-Solving",
      confidence: 80
    },
    situational: {
      text: "Consider multiple stakeholder perspectives, outline your decision-making process, and explain how you would measure success.",
      framework: "Decision-Making",
      confidence: 82
    },
    general: {
      text: "Provide specific examples from your experience, quantify your impact where possible, and relate your answer to the company's goals.",
      framework: "General",
      confidence: 75
    }
  };
  
  return suggestions[questionType] || suggestions.general;
}

// Handle tab activation for widget management
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && isSupportedPlatform(tab.url)) {
      // Platform detected, widget should be available
      console.log(`CandidAI active on supported platform: ${tab.url}`);
    }
  });
});

function isSupportedPlatform(url) {
  const supportedDomains = [
    'meet.google.com',
    'teams.microsoft.com',
    'zoom.us',
    'linkedin.com'
  ];
  
  return supportedDomains.some(domain => url.includes(domain));
}
