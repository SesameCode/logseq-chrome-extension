// Content script for Logseq Chrome extension
let lastSelection = "";
let floatingButton = null;
let selectionTimeout = null;

// Track text selection continuously
document.addEventListener("mouseup", handleSelection);
document.addEventListener("keyup", handleSelection);

// Hide floating button when clicking elsewhere
document.addEventListener("mousedown", (event) => {
  if (floatingButton && !floatingButton.contains(event.target)) {
    hideFloatingButton();
  }
});

function handleSelection() {
  try {
    const selection = window.getSelection();
    
    // Check if selection exists and has ranges
    if (!selection || selection.rangeCount === 0) {
      hideFloatingButton();
      return;
    }
    
    const text = selection.toString().trim();
    
    if (text && text.length > 3) { // Only show for meaningful selections
      lastSelection = text;
      chrome.storage.local.set({ currentSelection: text });
      
      // Clear existing timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      
      // Show floating button after short delay
      selectionTimeout = setTimeout(() => {
        showFloatingButton(selection);
      }, 300);
      
    } else {
      hideFloatingButton();
    }
  } catch (error) {
    console.error("Selection handling error:", error);
    hideFloatingButton();
  }
}

function showFloatingButton(selection) {
  try {
    // Remove existing button
    hideFloatingButton();
    
    // Validate selection before proceeding
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    
    // Get selection position
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Create floating button
    floatingButton = document.createElement("div");
    floatingButton.className = "logseq-capture-floating-btn";
    floatingButton.innerHTML = `
      <div class="logseq-btn-icon">📝</div>
      <div class="logseq-btn-text">Capture to Logseq</div>
    `;
    
    // Position button near selection
    const buttonTop = Math.max(10, rect.bottom + window.scrollY + 10);
    const buttonLeft = Math.min(
      window.innerWidth - 200, 
      Math.max(10, rect.left + window.scrollX)
    );
    
    floatingButton.style.cssText = `
      position: absolute;
      top: ${buttonTop}px;
      left: ${buttonLeft}px;
      background: #6366f1;
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      z-index: 2147483647;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      user-select: none;
      border: none;
      outline: none;
    `;
    
    // Add hover effect
    floatingButton.addEventListener("mouseenter", () => {
      floatingButton.style.background = "#5855eb";
      floatingButton.style.transform = "translateY(-2px)";
      floatingButton.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.4)";
    });
    
    floatingButton.addEventListener("mouseleave", () => {
      floatingButton.style.background = "#6366f1";
      floatingButton.style.transform = "translateY(0)";
      floatingButton.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.3)";
    });
    
    // Add click handler
    floatingButton.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Show loading state
      floatingButton.innerHTML = `
        <div class="logseq-btn-icon">⏳</div>
        <div class="logseq-btn-text">Capturing...</div>
      `;
      floatingButton.style.background = "#8b5cf6";
      
      await captureAndOpenLogseq();
      hideFloatingButton();
    });
    
    document.body.appendChild(floatingButton);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideFloatingButton();
    }, 5000);
    
  } catch (error) {
    console.error("Error showing floating button:", error);
    hideFloatingButton();
  }
}

function hideFloatingButton() {
  if (floatingButton && floatingButton.parentNode) {
    floatingButton.parentNode.removeChild(floatingButton);
    floatingButton = null;
  }
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
    selectionTimeout = null;
  }
}

async function captureAndOpenLogseq() {
  try {
    const selection = window.getSelection();
    let text = "";
    
    // Safely get selected text
    if (selection && selection.rangeCount > 0) {
      text = selection.toString().trim();
    }
    
    // If no current selection, use last known selection
    if (!text) {
      text = lastSelection;
    }
    
    if (!text) {
      showToast("No text selected", "error");
      return;
    }
    
    const captureData = {
      content: text,
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    };
    
    // Send to background script for processing
    const response = await chrome.runtime.sendMessage({
      action: "captureText",
      data: captureData
    });
    
    if (response && response.success) {
      showToast("Captured successfully!", "success");
      
      // Wait a moment then try to open Logseq
      setTimeout(async () => {
        try {
          const logseqUrl = buildLogseqUrl(captureData);
          window.open(logseqUrl, '_blank');
          showToast("Opening Logseq...", "info");
        } catch (error) {
          showToast("Text captured. Click extension to open Logseq.", "info");
        }
      }, 500);
    } else {
      showToast("Capture failed. Try again.", "error");
    }
    
  } catch (error) {
    console.error("Capture failed:", error);
    showToast("Capture failed. Try again.", "error");
  }
}

function buildLogseqUrl(data) {
  const url = new URL("logseq://x-callback-url/quickCapture");
  url.searchParams.append("content", data.content);
  url.searchParams.append("url", data.url);
  url.searchParams.append("title", "source link");
  return url.href;
}

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "ping") {
      // Health check for content script
      sendResponse({ status: "ok" });
    } else if (request.action === "getSelection") {
      const selection = window.getSelection();
      let currentText = "";
      
      // Safely get current selection
      if (selection && selection.rangeCount > 0) {
        currentText = selection.toString().trim();
      }
      
      sendResponse({
        selectedText: currentText || lastSelection,
        url: window.location.href,
        title: document.title
      });
    } else if (request.action === "captureSelection") {
      captureAndOpenLogseq();
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("Message handling error:", error);
    sendResponse({ error: error.message });
  }
});

// Listen for keyboard shortcuts
document.addEventListener("keydown", (event) => {
  // Ctrl+Shift+L (Cmd+Shift+L on Mac)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "L") {
    event.preventDefault();
    captureAndOpenLogseq();
  }
});

function showToast(message, type = "info") {
  // Remove existing toasts
  const existingToast = document.querySelector(".logseq-capture-toast");
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement("div");
  toast.className = "logseq-capture-toast";
  toast.textContent = message;
  
  const bgColor = type === "success" ? "#10b981" : 
                  type === "error" ? "#ef4444" : 
                  type === "info" ? "#3b82f6" : "#6366f1";
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
    transform: translateX(100%);
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(0)";
  });
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}