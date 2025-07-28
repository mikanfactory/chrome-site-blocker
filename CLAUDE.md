# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Extension v3 サイトブロッカー - トグルでサイトをブロック/解除する拡張機能

## Architecture

- **manifest.json**: Extension configuration with permissions for storage, tabs, and all URLs
- **popup.html/popup.js**: Extension popup UI for toggling block status per domain
- **content.js**: Content script that blocks sites by replacing page content

### Data Flow
1. Popup retrieves current domain and blocked status from chrome.storage.local
2. User toggles block status → updates storage → reloads tab
3. Content script checks storage on page load and blocks if domain matches

### Storage Structure
- Key: `blockedHosts` (array of blocked domain strings)
- Domain matching includes subdomains (e.g., `example.com` blocks `www.example.com`)

## Development

This is a Manifest V3 Chrome extension with no build process required.

### Testing
Load as unpacked extension in Chrome:
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select this directory

### Debugging
- Popup: Right-click extension icon → Inspect popup
- Content script: Use browser DevTools on blocked pages
- Storage: Check in DevTools → Application → Storage → Local Storage → Extension