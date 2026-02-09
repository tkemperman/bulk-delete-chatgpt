// Updated script loading with new architecture
function loadGlobalsThenExecute(tabId, secondaryScript, callback) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["extensionCore.js", "config.js", "globals.js", "utils.js", "domHandler.js", "conversationHandler.js", "checkboxManager.js"],
    },
    () => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: [secondaryScript],
        },
        callback
      );
    }
  );
}

function addButtonListener(buttonId, scriptName) {
  document.getElementById(buttonId).addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab) {
        if (buttonId === "bulk-delete" || buttonId === "bulk-archive") {
          const button = document.getElementById(buttonId);
          button.disabled = true;
          button.classList.add("progress");
          loadGlobalsThenExecute(tab.id, scriptName);
        } else if (buttonId === "auto-bulk-delete") {
          // Don't disable - allow clicking again to cancel
          const button = document.getElementById(buttonId);
          button.classList.add("progress");
          loadGlobalsThenExecute(tab.id, scriptName);
        } else {
          loadGlobalsThenExecute(tab.id, scriptName);
        }
      }
    });
  });
}

function updateProgressBar(buttonId, progress) {
  console.log(`Updating progress bar for ${buttonId}:`, progress);
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.classList.add("progress");
  button.style.setProperty("--progress", `${progress}%`);
  button.setAttribute("data-progress", progress);

  let buttonText, actionText;
  if (buttonId === "bulk-delete") {
    buttonText = "Bulk Delete";
    actionText = "Deleting";
  } else if (buttonId === "auto-bulk-delete") {
    buttonText = "Auto Bulk Delete";
    actionText = "Deleting All";
  } else {
    buttonText = "Bulk Archive";
    actionText = "Archiving";
  }

  // Special handling for auto-bulk-delete: keep cancel text, don't disable
  if (buttonId === "auto-bulk-delete") {
    // Don't change the text - let the content script control it
    // Just update the progress bar via CSS
    return;
  }

  if (progress === 100) {
    button.disabled = true;
    button.textContent = "";
    const progressSpan = document.createElement("span");
    progressSpan.className = "progress-text";
    progressSpan.textContent = "100%";
    const textSpan = document.createElement("span");
    textSpan.className = "button-text";
    textSpan.textContent = `${actionText} Complete`;
    button.appendChild(progressSpan);
    button.appendChild(textSpan);

    // 显示 100% 一段时间后恢复原始状态
    setTimeout(() => {
      button.disabled = false;
      button.classList.remove("progress");
      button.textContent = "";
      const btnTextSpan = document.createElement("span");
      btnTextSpan.className = "button-text";
      btnTextSpan.textContent = buttonText;
      button.appendChild(btnTextSpan);
    }, 500); // 1000 毫秒 = 1 秒，您可以根据需要调整这个时间
  } else {
    button.disabled = true;
    button.textContent = "";
    const progressSpan = document.createElement("span");
    progressSpan.className = "progress-text";
    progressSpan.textContent = `${progress}%`;
    const textSpan = document.createElement("span");
    textSpan.className = "button-text";
    textSpan.textContent = `${actionText}...`;
    button.appendChild(progressSpan);
    button.appendChild(textSpan);
  }
}

// 在消息监听器中也添加文本重置
// Resolve button ID, handling stale content scripts that may use old IDs
function resolveButtonId(buttonId) {
  const aliases = { "bulk-delete-all": "auto-bulk-delete" };
  return aliases[buttonId] || buttonId;
}

function isAutoBulkDelete(buttonId) {
  return buttonId === "auto-bulk-delete" || buttonId === "bulk-delete-all";
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Received message:", request);
  const buttonId = resolveButtonId(request.buttonId);

  if (request.action === "updateProgress") {
    updateProgressBar(buttonId, request.progress);
  } else if (request.action === "operationComplete") {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.disabled = false;
    button.classList.remove("progress");
    button.style.backgroundColor = "";
    if (isAutoBulkDelete(buttonId)) {
      button.textContent = "Auto Bulk Delete";
      return;
    }
    updateProgressBar(buttonId, 100);
  } else if (request.action === "updateButtonText") {
    const button = document.getElementById(buttonId);
    if (button) {
      button.textContent = request.text;
    }
  } else if (request.action === "resetButton") {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = false;
      button.classList.remove("progress");
      button.style.backgroundColor = "";
      if (isAutoBulkDelete(buttonId)) {
        button.textContent = "Auto Bulk Delete";
      }
    }
  }
});

function initializeButtons() {
  addButtonListener("add-checkboxes", "addCheckboxes.js");
  addButtonListener("bulk-delete", "bulkDeleteConversations.js");
  addButtonListener("bulk-archive", "bulkArchiveConversations.js");
  addButtonListener("auto-bulk-delete", "autoBulkDeleteConversations.js");
  addButtonListener("toggle-checkboxes", "toggleCheckboxes.js");
  addButtonListener("remove-checkboxes", "removeCheckboxes.js");
}

async function loadVersion() {
  try {
    const manifestData = chrome.runtime.getManifest();
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge && manifestData.version) {
      versionBadge.textContent = `v${manifestData.version}`;
      
      // Add click handler to open Chrome Web Store page
      versionBadge.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({
          url: 'https://chromewebstore.google.com/detail/chatgpt-bulk-delete/effkgioceefcfaegehhfafjneeiabdjg?hl=en'
        });
      });
    }
  } catch (error) {
    console.error('Error loading version:', error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeButtons();
  loadVersion();
});
