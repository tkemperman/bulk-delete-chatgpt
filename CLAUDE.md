# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension (Firefox + Chrome) called "ChatGPT Bulk Delete" that allows users to bulk delete/archive conversations on ChatGPT pages. It's a Manifest V3 extension with no build process - the JavaScript files run directly in the browser.

## Architecture

### Core Components

- **manifest.json**: Firefox extension manifest (v3) - the default manifest
- **manifest.chrome.json**: Chrome extension manifest (v3) - for Chrome compatibility
- **popup.html/popup.js/popup.css**: Extension popup UI with buttons for different operations
- **background.js**: Background script handling keyboard shortcuts
- **Content Scripts** (injected into ChatGPT pages):
  - `extensionCore.js`: Core system initialization and module registry
  - `config.js`: Centralized configuration (selectors, constants, button IDs)
  - `globals.js`: Global state management
  - `utils.js`: Utility functions (DOM helpers, Chrome messaging)
  - `domHandler.js`: DOM manipulation and event handling utilities
  - `conversationHandler.js`: Business logic for delete/archive operations
  - `checkboxManager.js`: Checkbox creation and management
  - `addCheckboxes.js`: Adds checkboxes to conversation items
  - `bulkDeleteConversations.js`: Deletes selected (checked) conversations
  - `bulkArchiveConversations.js`: Archives selected (checked) conversations
  - `autoBulkDeleteConversations.js`: Automatically deletes ALL non-project chats
  - `toggleCheckboxes.js`: Toggle all checkboxes on/off
  - `removeCheckboxes.js`: Removes all added checkboxes

### Key Architecture Patterns

- **Content Script Injection**: Scripts are injected into `chat.openai.com` and `chatgpt.com` pages
- **DOM Manipulation**: Heavy use of DOM selectors to interact with ChatGPT's UI
- **Event-Driven**: Uses Chrome messaging API for popup ↔ content script communication
- **Progressive Enhancement**: Adds UI elements (checkboxes) to existing ChatGPT interface
- **Keyboard Shortcuts**: Configurable via browser's extension shortcut settings

### Critical UI Selectors (config.js)

The extension relies on specific CSS selectors to interact with ChatGPT's UI:
- `HISTORY`: History container with chat list (`[id^="history"]`)
- `CONVERSATION_SELECTOR`: Individual conversation links (`a` tags)
- `TITLE_SELECTOR`: Conversation title elements
- `INTERACTIVE_ELEMENT_SELECTOR`: Hoverable/clickable elements

## Development Workflow

### No Build Process
This extension has no build system - files are loaded directly. Changes to any `.js`, `.html`, or `.css` files require:
1. Making changes to source files
2. Reloading the extension
3. Refreshing the ChatGPT page (important: content scripts cache in the page)

### Testing
- **Firefox**: Load via `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on" → select `manifest.json`
- **Chrome**: Load via `chrome://extensions/` in developer mode
- Navigate to `https://chatgpt.com`
- Test functionality with actual ChatGPT conversations
- Monitor browser console for errors/logs

### Browser Manifests
- `manifest.json` — Firefox (default). Uses `background.scripts` and `browser_specific_settings.gecko`
- `manifest.chrome.json` — Chrome. Uses `background.service_worker`
- Both share the same permissions: `scripting`, `activeTab`, `storage`

## Key Technical Details

### Extension Permissions
- `scripting`: To inject content scripts
- `activeTab`: To access current tab content
- `storage`: For local data persistence

### ChatGPT UI Integration
- Uses mouse events (`mouseover`, `pointer down`) to trigger ChatGPT's context menus
- Waits for dynamic elements to appear/disappear using polling with timeouts
- Handles ChatGPT's dynamic UI updates and element recreation
- Multi-language support for menu button detection (Delete/Archive in 20+ languages)

### Keyboard Shortcuts
- Configurable via browser extension shortcut settings
- **Firefox**: `about:addons` → gear icon → Manage Extension Shortcuts
- **Chrome**: `chrome://extensions/shortcuts`
- Available command: `auto-bulk-delete` — starts/cancels Auto Bulk Delete
- Pressing the shortcut again while running cancels the operation

## Common Issues & Debugging

### Selector Breakage
ChatGPT frequently updates their UI, breaking selectors in `config.js`. When functionality fails:
1. Inspect ChatGPT page elements in browser dev tools
2. Update selectors in `UI_CONFIG.SELECTORS` in `config.js`
3. Test with extension reload

### Stale Content Scripts
After reloading the extension, content scripts already injected in open ChatGPT tabs keep old code. Always refresh the ChatGPT page after reloading the extension. The popup handles old button IDs via `resolveButtonId()` alias mapping for robustness.

## Script Loading Order
Scripts load in dependency order via manifest.json content_scripts:
1. `extensionCore.js` - Core system initialization
2. `config.js` - Configuration constants
3. `globals.js` - Global state
4. `utils.js` - Utility functions
5. `domHandler.js` - DOM helpers
6. `conversationHandler.js` - Business logic
7. `checkboxManager.js` - Checkbox management

Operation-specific scripts (`addCheckboxes.js`, `bulkDeleteConversations.js`, etc.) are injected on demand via `popup.js` or `background.js`.

## Auto Bulk Delete Feature

### How it works
The "Auto Bulk Delete" button (or keyboard shortcut) automatically deletes all chats that are NOT in ChatGPT Projects:

1. The extension uses the `[id^="history"]` selector which only matches the regular chat history container
2. Chats inside Projects live in a different DOM structure and are NOT matched by this selector
3. The `autoBulkDeleteConversations.js` script:
   - Finds all visible non-project chats
   - Deletes them one by one via ChatGPT's UI (hover → menu → delete → confirm)
   - Repeats the process until no more non-project chats remain
   - Handles lazy-loading (new chats appearing as old ones are deleted)
   - Stops if a batch deletes 0 conversations (prevents infinite retries)

### Cancellation
- Click the button again while running, or press the keyboard shortcut again
- Uses a global `window.DeleteAllNonProjectState` flag checked between operations

### Safety
- Chats in Projects are **never** deleted (they're in a separate DOM container)
- Progress is shown in the popup button
- Can be cancelled at any time
