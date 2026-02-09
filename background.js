console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "auto-bulk-delete") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab) return;
      // Core scripts are already loaded via manifest content_scripts.
      // Just inject the operation script — re-injection toggles cancel.
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["autoBulkDeleteConversations.js"],
      });
    });
  }
});

console.log("Background script setup complete");
