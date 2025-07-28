# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Extension v3 サイトブロッカー - トグルでサイトをブロック/解除する拡張機能

## Architecture

- **src/popup/index.tsx**: React-based popup UI for toggling block status per domain
- **src/content/content.js**: Content script that blocks sites by replacing page content
- **manifest.json**: Extension configuration with permissions for storage, tabs, and all URLs
- **vite.config.ts**: Build configuration for popup using Vite + React

### Data Flow
1. Popup retrieves current domain and blocked status from chrome.storage.local
2. User toggles block status → updates storage → reloads tab
3. Content script checks storage on page load and blocks if domain matches

### Storage Structure
- Key: `blockedHosts` (array of blocked domain strings)
- Key: `timeLimitEndTime` (timestamp for time limit feature)
- Domain matching includes subdomains (e.g., `example.com` blocks `www.example.com`)

### Time Limit Feature
Content script checks `timeLimitEndTime` and bypasses blocking if current time is before the limit.

## Development

### Build Commands
- `npm run build`: Full build (popup + content + manifest)
- `npm run build:popup`: Build React popup using Vite
- `npm run build:content`: Copy content scripts to dist
- `npm run build:manifest`: Copy manifest to dist

### Tech Stack  
- React 19 + TypeScript for popup UI
- Vite for popup build process
- Plain JavaScript for content scripts

### Testing
Load as unpacked extension in Chrome:
1. Run `npm run build` to create dist directory
2. Open `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select the `dist` directory

### Debugging
- Popup: Right-click extension icon → Inspect popup
- Content script: Use browser DevTools on blocked pages
- Storage: Check in DevTools → Application → Storage → Local Storage → Extension