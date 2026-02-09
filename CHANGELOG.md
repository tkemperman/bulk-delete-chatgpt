# Changelog

## v7.0

### New Features

- **Keyboard shortcut** for Auto Bulk Delete — configurable via browser extension settings
  - Press again while running to cancel
- **Firefox as primary target** with dedicated manifest; Chrome manifest kept separately

### Improvements

- **Auto Bulk Delete rewritten** — deletes conversations directly via UI interaction instead of going through checkboxes
  - Stops automatically when no more chats are found
  - Cancellable at any time (button click or keyboard shortcut)
- **Bulk Archive paywall removed** — feature now works without payment
- Removed sponsor and MyNav ad from popup footer
- Removed all external API calls, analytics, and identity permissions
- Buttons now reset properly when no conversations are selected

## v6.2

### New Features

- **Auto Bulk Delete**: Automatically delete all non-project chats with a single click
  - Safely skips chats inside ChatGPT Projects
  - Handles lazy-loaded conversations by repeating until all are deleted
  - Shows progress in the popup button

### Improvements

- Firefox compatibility fixes
- Firefox support added alongside Chrome
