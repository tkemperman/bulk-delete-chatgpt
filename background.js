console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

console.log("Background script setup complete");
