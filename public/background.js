
// Enhanced background service worker for CandidAI Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CandidAI enhanced extension installed');
  
  // Set up initial configuration
  chrome.storage.local.set({
    candidaiConfig: {
      overlayStyle: 'subtitle',
      autoStart: false,
      aiProvider: 'openai',
      confidenceThreshold: 70
    }
  });
});

// Handle messages from content scripts and popup
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
  
  if (request.action === 'generateSuggestion') {
    handleAISuggestionRequest(request, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'enhancedWidgetInjected') {
    console.log(`Enhanced widget injected on ${request.platform} with features:`, request.features);
    
    // Update badge to show active status
    chrome.action.setBadgeText({
      text: '●',
      tabId: sender.tab?.id
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#10b981', // Green for active
      tabId: sender.tab?.id
    });
  }
});

async function handleAISuggestionRequest(request, sendResponse) {
  try {
    console.log('Generating AI suggestion for:', request.context);
    
    // Get stored AI configuration
    const result = await chrome.storage.local.get(['candidaiConfig', 'aiSettings']);
    const config = result.candidaiConfig || {};
    const aiSettings = result.aiSettings || {};
    
    // Check if we have API keys configured
    if (!aiSettings.openaiKey && !aiSettings.claudeKey && !aiSettings.geminiKey) {
      sendResponse({
        suggestion: 'Please configure your AI provider API keys in the CandidAI settings to get personalized suggestions.',
        confidence: 60,
        framework: request.framework || 'general'
      });
      return;
    }
    
    // Try to generate suggestion with available providers
    let suggestion = null;
    
    // Try OpenAI first
    if (aiSettings.openaiKey) {
      suggestion = await generateOpenAISuggestion(
        request.context, 
        request.questionType, 
        request.framework,
        aiSettings.openaiKey
      );
    }
    
    // Fallback to Claude if OpenAI fails
    if (!suggestion && aiSettings.claudeKey) {
      suggestion = await generateClaudeSuggestion(
        request.context, 
        request.questionType, 
        request.framework,
        aiSettings.claudeKey
      );
    }
    
    // Fallback to Gemini if others fail
    if (!suggestion && aiSettings.geminiKey) {
      suggestion = await generateGeminiSuggestion(
        request.context, 
        request.questionType, 
        request.framework,
        aiSettings.geminiKey
      );
    }
    
    // Final fallback to rule-based suggestions
    if (!suggestion) {
      suggestion = generateFallbackSuggestion(request.context, request.questionType, request.framework);
    }
    
    sendResponse(suggestion);
    
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    sendResponse({
      suggestion: 'Unable to generate AI suggestion at the moment. Please try again.',
      confidence: 50,
      framework: request.framework || 'general'
    });
  }
}

async function generateOpenAISuggestion(context, questionType, framework, apiKey) {
  try {
    const prompt = buildPrompt(context, questionType, framework);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional interview coach providing concise, actionable advice.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const suggestion = data.choices[0]?.message?.content || 'No suggestion available';
    
    return {
      suggestion: suggestion.trim(),
      confidence: 90,
      framework: framework,
      provider: 'OpenAI'
    };
  } catch (error) {
    console.error('OpenAI suggestion error:', error);
    return null;
  }
}

async function generateClaudeSuggestion(context, questionType, framework, apiKey) {
  try {
    const prompt = buildPrompt(context, questionType, framework);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    const data = await response.json();
    const suggestion = data.content[0]?.text || 'No suggestion available';
    
    return {
      suggestion: suggestion.trim(),
      confidence: 88,
      framework: framework,
      provider: 'Claude'
    };
  } catch (error) {
    console.error('Claude suggestion error:', error);
    return null;
  }
}

async function generateGeminiSuggestion(context, questionType, framework, apiKey) {
  try {
    const prompt = buildPrompt(context, questionType, framework);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const suggestion = data.candidates[0]?.content?.parts[0]?.text || 'No suggestion available';
    
    return {
      suggestion: suggestion.trim(),
      confidence: 85,
      framework: framework,
      provider: 'Gemini'
    };
  } catch (error) {
    console.error('Gemini suggestion error:', error);
    return null;
  }
}

function buildPrompt(context, questionType, framework) {
  const frameworks = {
    star: 'Structure your response using STAR method (Situation, Task, Action, Result)',
    soar: 'Use SOAR framework (Situation, Obstacles, Actions, Results)',
    prep: 'Apply PREP method (Point, Reason, Example, Point)',
    car: 'Use CAR framework (Challenge, Action, Result)'
  };
  
  const questionTypes = {
    behavioral: 'This is a behavioral interview question requiring specific examples',
    technical: 'This is a technical question requiring clear explanation',
    situational: 'This is a situational question requiring hypothetical reasoning',
    general: 'This is a general interview question'
  };
  
  return `You are an expert interview coach providing real-time assistance.

Question/Context: "${context}"
Type: ${questionTypes[questionType] || questionTypes.general}
Framework: ${frameworks[framework] || frameworks.star}

Provide a concise, actionable suggestion (1-2 sentences) to help answer this effectively. Focus on:
1. Key points to mention
2. Structure using the specified framework
3. Specific advice for a strong response

Be supportive, specific, and immediately actionable.`;
}

function generateFallbackSuggestion(context, questionType, framework) {
  const suggestions = {
    behavioral: [
      'Use the STAR method: describe a specific Situation, your Task, the Action you took, and the positive Result.',
      'Think of a concrete example from your experience that demonstrates the skill they\'re asking about.',
      'Structure your answer with a clear beginning, middle, and end, focusing on your specific contributions.'
    ],
    technical: [
      'Break down your explanation into simple steps and use concrete examples.',
      'Start with the basic concept, then explain your approach and reasoning.',
      'Mention any relevant technologies or methodologies you\'ve used.'
    ],
    situational: [
      'Outline your thought process step-by-step and explain your reasoning.',
      'Consider multiple approaches and explain why you\'d choose one over others.',
      'Connect your response to similar situations you\'ve actually encountered.'
    ],
    general: [
      'Provide specific examples from your experience to support your answer.',
      'Structure your response clearly and stay focused on the question asked.',
      'Highlight relevant skills and achievements that relate to this role.'
    ]
  };
  
  const typeKey = questionType || 'general';
  const suggestionArray = suggestions[typeKey] || suggestions.general;
  const randomSuggestion = suggestionArray[Math.floor(Math.random() * suggestionArray.length)];
  
  return {
    suggestion: randomSuggestion,
    confidence: 70,
    framework: framework,
    provider: 'Fallback'
  };
}

// Monitor tab updates for enhanced badge management
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
        color: '#ec4899', // Pink for supported
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

// Handle tab audio capture requests
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'audio-capture') {
    port.onMessage.addListener(async (request) => {
      if (request.action === 'startTabCapture') {
        try {
          const stream = await chrome.tabCapture.capture({
            audio: true,
            video: false
          });
          
          port.postMessage({
            action: 'captureStarted',
            success: true
          });
        } catch (error) {
          port.postMessage({
            action: 'captureError',
            error: error.message
          });
        }
      }
    });
  }
});

console.log('CandidAI enhanced background service worker loaded');
