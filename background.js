// Background script for Logseq Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu
  chrome.contextMenus.create({
    id: "captureToLogseq",
    title: "Capture to Logseq",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "captureToLogseq") {
    const selectedText = info.selectionText;
    const pageUrl = tab.url;
    const pageTitle = tab.title;
    
    const captureData = {
      content: selectedText,
      url: pageUrl,
      title: pageTitle,
      timestamp: new Date().toISOString()
    };
    
    await handleCapture(captureData);
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureText") {
    handleCapture(request.data);
    sendResponse({ success: true });
  } else if (request.action === "getSelectedText") {
    // Get current selection from active tab with error handling
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ error: "No active tab found" });
        return;
      }
      
      try {
        // Inject content script if needed
        await ensureContentScriptInjected(tabs[0].id);
        
        chrome.tabs.sendMessage(tabs[0].id, { action: "getSelection" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Message sending failed:", chrome.runtime.lastError);
            sendResponse({ error: "Failed to get selection" });
          } else {
            sendResponse(response || { selectedText: "", url: tabs[0].url, title: tabs[0].title });
          }
        });
      } catch (error) {
        console.error("Content script injection failed:", error);
        sendResponse({ error: "Content script injection failed" });
      }
    });
    return true; // Keep message channel open for async response
  }
});

async function ensureContentScriptInjected(tabId) {
  try {
    // Test if content script is already injected
    await chrome.tabs.sendMessage(tabId, { action: "ping" });
  } catch (error) {
    // Content script not injected, inject it now
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  }
}

async function handleCapture(data) {
  // Format the text for Logseq
  const formattedText = formatForLogseq(data);
  
  // Store in extension storage
  await chrome.storage.local.set({
    lastCapture: {
      text: formattedText,
      rawContent: data.content,
      url: data.url,
      title: data.title,
      timestamp: data.timestamp
    }
  });
  
  // Show notification
  try {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Logseq Capture",
      message: "Text captured! Click extension to copy or open Logseq."
    });
  } catch (error) {
    console.error("Notification failed:", error);
  }
}

function formatForLogseq(data) {
  const timestamp = new Date().toLocaleString();
  const content = data.content.trim();
  
  // Format as Logseq block with "source link" as link text
  return `- ${content}
  - Source: [source link](${data.url})
  - Captured: ${timestamp}`;
}