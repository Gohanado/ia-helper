# Build Guide - IA Helper

How to build Chrome and Firefox packages.

## Project structure
- **Chrome**: Standard ES6 modules
 - **Firefox**: Adapted manifest + bundled scripts

## Build

### One-shot
```bash
npm run package
```
This cleans `dist/`, creates `dist/chrome/` and `dist/firefox/`, then zips:
- `dist/ia-helper-chrome-v{version}.zip`
- `dist/ia-helper-firefox-v{version}.zip`

## Chrome vs Firefox

### Manifest
- Chrome (`manifest.json`): service_worker
- Firefox (generated): background scripts + `browser_specific_settings` (gecko id, min version, data_collection_permissions).

### JS bundling (Firefox)
Firefox validator dislikes ES modules. The Firefox build:
1) Bundles JS (inlines imports/exports)
2) Removes `type="module"` from HTML

Bundled files:
- `src/chat/chat.js` (+ translations, agents, dom-sanitizer)
- `src/options/options.js` (+ translations, agents, dom-sanitizer)
- `src/results/results.js` (+ translations, dom-sanitizer)

Runtime behavior stays the same; syntax is non-module for validation.

## Version bump checklist
1. Update versions in `manifest.json`, `package.json`, `version.json`
2. Update `CHANGELOG.md`
3. Build: `npm run package`

## Store uploads
- Chrome Web Store: `dist/ia-helper-chrome-v{version}.zip`
- Firefox Add-ons: `dist/ia-helper-firefox-v{version}.zip`

## Notes
- Never edit `dist/` by hand; always build from `src/`
- `dist/` is gitignored
- Same source code for both targets; only manifests/bundling differ
