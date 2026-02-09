# ChatGPT Bulk Delete

A Firefox browser extension to bulk delete and archive conversations on ChatGPT. Also works on Chrome.

## Features

- **Add Checkboxes** to conversations for manual selection (hold Shift for range select)
- **Toggle / Remove Checkboxes** to quickly select or deselect all
- **Bulk Delete** selected conversations
- **Bulk Archive** selected conversations
- **Auto Bulk Delete** — automatically deletes all non-project chats with a single click
- **Keyboard shortcut** — configurable shortcut for Auto Bulk Delete (set via browser extension settings)

## Installation

This is a personal fork. To use it, build and sign the extension yourself:

### Firefox
1. `zip -r extension.zip . -x ".git/*" ".idea/*" ".claude/*" "manifest.chrome.json" "CLAUDE.md" "CHANGELOG.md" "README.md" ".gitignore"`
2. Upload at [addons.mozilla.org/developers](https://addons.mozilla.org/en-US/developers/addons) → Upload New Version (self-distribution)
3. Install the signed `.xpi`

### Chrome
1. Rename `manifest.chrome.json` to `manifest.json`
2. Load via `chrome://extensions/` in developer mode

## Usage

1. Open [chatgpt.com](https://chatgpt.com)
2. Click the extension icon in your browser toolbar
3. Use **Add Checkboxes** to select specific conversations, then **Bulk Delete** or **Bulk Archive**
4. Or use **Auto Bulk Delete** to automatically delete all non-project chats