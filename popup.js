// Popup script for Logseq Chrome extension
document.addEventListener("DOMContentLoaded", async () => {
  const capturePreview = document.getElementById("capturePreview");
  const captureBtn = document.getElementById("captureBtn");
  const copyBtn = document.getElementById("copyBtn");
  const openLogseqBtn = document.getElementById("openLogseqBtn");
  const logseqUrl = document.getElementById("logseqUrl");
  const successMessage = document.getElementById("successMessage");
  
  let lastCaptureData = null;
  
  // Load last capture on popup open
  await loadLastCapture();
  
  // Capture button click
  captureBtn.addEventListener("click", async () => {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        showSuccess("No active tab found", "error");
        return;
      }
      
      // Get selection from content script with timeout
      const response = await sendMessageWithTimeout(tab.id, { action: "getSelection" }, 5000);
      
      if (response && response.selectedText) {
        const captureData = {
          content: response.selectedText,
          url: response.url,
          title: response.title,
          timestamp: new Date().toISOString()
        };
        
        // Send to background for processing
        await chrome.runtime.sendMessage({
          action: "captureText",
          data: captureData
        });
        
        showSuccess("Text captured successfully!");
        await loadLastCapture();
      } else if (response && response.error) {
        showSuccess(response.error, "error");
      } else {
        showSuccess("No text selected. Please select text first.", "error");
      }
    } catch (error) {
      console.error("Capture failed:", error);
      if (error.message.includes("connection")) {
        showSuccess("Page needs to be refreshed. Please reload the page and try again.", "error");
      } else {
        showSuccess("Failed to capture text. Try selecting text again.", "error");
      }
    }
  });
  
  // Copy button click
  copyBtn.addEventListener("click", async () => {
    if (lastCaptureData) {
      try {
        await navigator.clipboard.writeText(lastCaptureData.text);
        showSuccess("Copied to clipboard!");
      } catch (error) {
        // Fallback for older browsers
        fallbackCopyToClipboard(lastCaptureData.text);
        showSuccess("Copied to clipboard!");
      }
    }
  });
  
  // Open Logseq button click
  openLogseqBtn.addEventListener("click", async () => {
    if (lastCaptureData) {
      const url = buildLogseqUrl(lastCaptureData);
      
      try {
        // Try to open the URL scheme
        await chrome.tabs.create({ url: url, active: false });
        showSuccess("Opening Logseq...");
        
        // Close the created tab after a moment (it will have served its purpose)
        setTimeout(async () => {
          try {
            const tabs = await chrome.tabs.query({});
            const logseqTab = tabs.find(tab => tab.url && tab.url.startsWith("logseq://"));
            if (logseqTab) {
              chrome.tabs.remove(logseqTab.id);
            }
          } catch (error) {
            // Ignore cleanup errors
            console.error("Tab cleanup error:", error);
          }
        }, 1000);
        
      } catch (error) {
        // Fallback: copy the URL to clipboard
        try {
          await navigator.clipboard.writeText(url);
          showSuccess("Logseq URL copied to clipboard. Paste it in your browser.", "error");
        } catch (clipError) {
          showSuccess("Failed to open Logseq. Copy the text manually.", "error");
        }
      }
    }
  });
  
  // Helper function to send message with timeout
  function sendMessageWithTimeout(tabId, message, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Message timeout - connection failed"));
      }, timeout);
      
      chrome.tabs.sendMessage(tabId, message, (response) => {
        clearTimeout(timer);
        
        if (chrome.runtime.lastError) {
          reject(new Error(`Connection error: ${chrome.runtime.lastError.message}`));
        } else {
          resolve(response);
        }
      });
    });
  }
  
  async function loadLastCapture() {
    try {
      const data = await chrome.storage.local.get("lastCapture");
      if (data.lastCapture) {
        lastCaptureData = data.lastCapture;
        capturePreview.textContent = lastCaptureData.rawContent || lastCaptureData.text;
        copyBtn.disabled = false;
        openLogseqBtn.disabled = false;
      } else {
        capturePreview.innerHTML = '<div class="empty-state">No text captured yet</div>';
        copyBtn.disabled = true;
        openLogseqBtn.disabled = true;
      }
    } catch (error) {
      console.error("Error loading last capture:", error);
      capturePreview.innerHTML = '<div class="empty-state">Error loading data</div>';
      copyBtn.disabled = true;
      openLogseqBtn.disabled = true;
    }
  }
  
  function buildLogseqUrl(data) {
    const baseUrl = logseqUrl.value || "logseq://x-callback-url/quickCapture";
    const url = new URL(baseUrl);
    url.searchParams.append("content", data.rawContent || data.text);
    url.searchParams.append("url", data.url);
    url.searchParams.append("title", data.title);
    return url.href;
  }
  
  function showSuccess(message, type = "success") {
    successMessage.textContent = message;
    successMessage.style.display = "block";
    successMessage.style.background = type === "error" ? "#fee2e2" : "#d1fae5";
    successMessage.style.color = type === "error" ? "#dc2626" : "#065f46";
    
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  }
  
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (error) {
      console.error("Fallback copy failed:", error);
    } finally {
      textArea.remove();
    }
  }
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lastCapture) {
      loadLastCapture();
    }
  });
});