# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Upcoming
- Advanced logging & debugging
- Auto light/dark mode
- Custom system instructions
- Default language switched to English for interface and responses (fresh installs)

---

## [2.0.0] - 2025-12-08

### Status
- **CHROME STABLE**: OK
- **FIREFOX**: Inline popup long-generation still under investigation (stops too early)

### Added / Improved
- **Full internationalization**: agent names/descriptions, base actions, chat suggestions, context-menu labels.
- **Context menu**: translated labels for `pageActions` and `createCustomAction`, direct open of action creation (Presets tab).
- **Chat experience**: localized suggestions, localized agent badge, enforced agent response language.
- **Docs**: refreshed README (multi-providers, Ollama local, packaging), updated Chrome Store docs and docs/README.
- **Packaging**: cleaned tracked ZIP artifacts, unified version 2.0.0 (Chrome/Firefox manifests, package.json, version.json).

### Technical
- Packaging scripts kept (`npm run package`, scripts/build-*.js/ps1); ZIPs ignored by git.
- Known issue: Firefox inline popup can stop long generations (to fix).

---

## [1.9.2] - 2025-12-07

### Status
- **CHROME STABLE**: 100% functional (all features tested/validated)
- **FIREFOX**: Needs fixes (context menu incomplete, popup no response, results not loading)

### Added
- **Page actions**: 4 new actions in popup Page section
  - Translate page: full page translation
  - Analyze sentiment: tone/sentiment analysis
  - Extract links: collect/organize all links
  - Generate outline: structured outline of content
- **Stop generation**: LLM generation control
  - “Stop” button in inline response popup
  - Stop button on results page
  - Auto-stop when closing popup
  - Saves resources (no background generations)
- **Context menu improvements**: organization + translations
  - Fully translated “Create custom action” in all languages
  - Direct navigation to Presets tab for custom action creation
  - Optimized structure

### Improved
- **Ultra-fast language detection**: faster TTS startup
  - Replaced AI detection (10–15s) with client detection (<1ms)
  - Common words check for 5 langs (FR, EN, ES, IT, PT)
  - Instant TTS start, no network request
- **TTS voice selection**: voice loads correctly first time (popup, results, live chat)
  - Voice load wait with `voiceschanged` listener + safety timeout
- **Quick prompt**: behavior fixed
  - Shows only inline response popup (no chat open)
  - Tooltip fixed: “Send” instead of “Send to chat”
  - Consistent UX
- **Streaming ports**: optimized architecture
  - `currentStreamingPort` tracks active connections
  - Clean disconnect when popup closes
  - Prevents resource leaks

### Fixed
- **Inline response popup**: no simultaneous chat open
- **Popup size**: fixed height 600px + internal scroll; no resize flicker
- **Context menu**: translated `pageActions` / `createCustomAction`

### Technical
- **Translations added**: new i18n keys
  - stopGeneration, generationStopped, translatePage, analyzeSentiment, extractLinks, generateOutline, pageActions
- **Files touched**: chat.js (TTS voice), content-script.js (stop button, fast detect, TTS), results.js/html/css (stop), popup.js/html (quick prompt, page actions), options.js (navigate Presets), translations.js

---

## [1.9.1] - 2025-12-06

### Status
- **FIREFOX STABLE**: 100% validated (0 errors/warnings)
- **CHROME STABLE**: Tested/functional

### Fixed
- **Firefox Add-ons validation**: all warnings removed
  - `innerHTML` replaced by DOMParser in dom-sanitizer.js & content-script.js
  - `data_collection_permissions` set to required: ["none"]
  - strict_min_version 142.0
  - ZIP format with Unix slashes
- **Syntax errors**: all JS syntax issues fixed
  - Missing parentheses in setTrustedHTML() (options.js, chat.js, content-script.js)
  - config fix in results.js (ollamaUrl -> apiUrl)
- **Streaming results.js**: removed flicker
  - Removed CSS fadeIn causing flicker
  - Implemented Chrome Port streaming like chat.js
  - Real-time markdown parsing, better performance

---

## [1.9.0] - 2025-12-06

### Added
- **Custom AI agents**: full agent management
  - Options UI with agent grid
  - 6 built-in agents (General Assistant, Developer, Writer, Translator, Analyst, Teacher, Creative)
  - Create custom agents with all params (name, description, icon, system prompt)
  - Advanced params: temperature, max tokens, top_p, frequency/presence penalties
  - Model per agent; actions: create/edit/duplicate/delete
  - Agent selector in chat header; dropdown with built-in/custom sections; agent badge with icon
  - Conversation stores selected agent; applies agent params to API requests
  - Works with all providers (Ollama, OpenAI, Anthropic, Groq, OpenRouter, Custom)

- **Multi-browser build**: separate build system for Chrome/Firefox
  - `npm run package`
  - Dist folders: `dist/chrome/`, `dist/firefox/`
  - ES6 bundling for Firefox
  - Manifest config per browser
  - Docs in BUILD.md

### Fixed
- **Code blocks overflow**: horizontal scroll, max width 100%, prevent overflow
- **Blockquotes**: reduced vertical spacing (12px -> 6px)
- **Firefox compatibility**:
  - Added `data_collection_permissions` to manifest
  - Bundled JS to avoid validation errors
  - Removed `type="module"` in HTML
  - Proper `browser_specific_settings`

---

## [1.8.4] - 2025-12-06

### Fixed
- **Markdown parser**: correct tables/inline formatting
  - Placeholder fix to avoid italics conflict
  - Parses table cells (inline code/bold/italic/links)
  - Restores protected blocks (code/tables)
  - Copy buttons shown in tables
  - Removed extra spaces/indent in HTML templates

---

## [1.8.3] - 2025-12-06

### Added
- **Code blocks UX**: pro display + copy button per block
  - Header with language name, trim code, colored background/border
- **Model selector in header**: fast model switch
  - Dropdown models, badge clickable, updates config instantly
  - Supports all providers; defaults per provider; message if none
- **Multi-select conversations**: bulk management
  - “Select” mode, checkboxes, “Delete (X)” with count, confirmation, translated

### Improved
- **Chat header**: text offset to avoid hamburger overlap when collapsed
- **Code blocks**: ultra-compact header (padding 3px 8px, height 24px, font 9px, copy btn 18px)
- **Inline code**: copy-on-hover, minimal design, visual feedback

### Fixed
- **Delete all button**: variable fix
- **Model selector**: uses config.provider
- **Ollama models**: dynamic fetch
- **OpenRouter models**: full list
- **Markdown rendering**: placeholder system to avoid conflicts (code/inline code extracted before escapeHtml, restore placeholders)
- **Dropdown menus**: close when clicking elsewhere (copy/model)

---

## [1.8.2] - 2025-12-06

### Added
- **LaTeX support**: inline `\( ... \)` and block `\[ ... \]`, serif styling
- **Copy options menu**: plain text or Markdown
- **Bulk delete conversations**: “Delete all” with confirmation, translated

### Improved
- **Sidebar collapse**: page shifts left (negative margin), smooth animation, better header alignment

### Fixed
- **Chat header**: moves correctly with collapsed sidebar
- **Copy menu**: auto-close on outside click

---

## [1.8.1] - 2025-12-06

### Added
- **Full Markdown support**: headers, HR, blockquotes, strikethrough, links, images, task lists, bold/italic, code blocks with language

### Improved
- **Sidebar collapse**: fully hides; hamburger fixed; smooth opacity; header padding adjusts
- **Control buttons**: intelligent display (stop generation hidden during speech-only; stop speech only during TTS)
- **TTS Markdown cleanup**: removes emojis/tables for natural speech

### Fixed
- Stop generation button not shown during speech-only
- Chat header alignment on collapse
- Table rendering in HTML
- Emojis not read by TTS

---

## [1.8.0] - 2025-12-06

### Added
- **Thinking support**: separate “Thinking” section for compatible models; live streaming
- **Control buttons**: Stop generation, Stop speech; abort signal sent to LLM server
- **Markdown cleanup for TTS**: strips formatting before speech

### Improved
- **Sidebar collapsible**: partially visible at 50px; toggle always accessible
- **Smart auto-scroll**: disable on manual scroll up; re-enable when user scrolls down
- **Error handling**: better abort/error management

### Fixed
- Sidebar stays on-screen when reduced
- TTS no longer reads raw Markdown
- Streaming shows progressive responses in real time
- Abort stops server generation too

---

## [1.7.0] - 2025-12-06

### Added
- **Full chat**: chat UI from popup
  - Freeform conversations, local history, sidebar list, search, export, delete, context memory, real-time streaming, prompt suggestions, TTS, copy one-click
- **Chat button in popup**: quick access
- **Chat translations**: UI in 5 languages (FR, EN, ES, IT, PT)

### Improved
- **TTS options**: voice selector from system voices
- **Tone presets**: low/high pitch buttons
- **Multilingual voice test**: test text adapts to voice language

---

## [1.6.0] - 2025-12-05

### Added
- **Text-to-Speech**: “Read” button (popup inline, quick prompt, results)
  - Multilingual (FR, EN, ES, IT, PT)
  - “Stop” button; automatic Markdown cleanup for speech

### Fixed
- **Chrome Web Store compliance**: removed “tabs” permission (activeTab sufficient)

---

## [1.5.0] - 2025-11-27

### Added
- **Direct response in input**: option to stream AI response directly in active field
- **Insertion mode**: replace or append
- **Firefox support**: MV3
- **Build script**: `build.ps1` for Chrome/Firefox packages

### Fixed
- **Quick prompt popup**: shows generation popup properly
- **actionId for custom_prompt**: auto-defined
- **Content restore**: original content restored on error

### Improved
- **Translations**: new keys for direct input options (5 languages)

---

## [1.4.9] - 2025-11-27

### Fixed
- **Quick prompt works**: prompt field sends requests
- **Shortcuts button**: opens Shortcuts tab (not chrome://extensions)
- **Reduced popup scroll**: less padding
- **“...” languages button**: improved style

### Improved
- **custom_prompt support** in content-script
- **Hash navigation** in options (ex: options.html#shortcuts)

---

## [1.4.8] - 2025-11-27

### Added
- **Popup redesign**: pro UI with quick prompt, quick actions, translation, model info
- **Context menu translated**: all right-click titles in 5 languages
- **Update messages translated**: update notifications use i18n

### Improved
- **Popup translations**: 15+ new keys (connecting, ready, offline, askAnything, etc.)
- **Multi-provider in popup**: shows active provider/model
- **Connection check**: provider-specific tests

### Changed
- **Simplified popup**: no tabs, all features visible
- **Modern design**: SVG icons, language pills, model info bar

---

## [1.4.7] - 2025-11-27

### Improved
- **results.html translated**: full i18n
- **Reduce/Expand toggle**: translated buttons
- **Notifications**: results.js uses t() for copy/errors/status

### Removed
- **Useless buttons**: removed “Close” and “Apply” from results.html

---

## [1.4.6] - 2025-11-27

### Improved
- **100% translations**: all keys for 5 languages (FR, EN, ES, IT, PT)
- **Inline popup translated**: response popup uses i18n (Copy, View details, Close, etc.)
- **Notifications translated**: options.js uses t() instead of hardcoded text
- **New keys added**: reduce, expand, waiting, responseWillAppear, apply, copyOptions, updates, checking, checkNow, changelog, changelogDesc, viewChangelog, documentationDesc, readDoc, reportProblem, credits, developer, contact, license, freePersonalUse, resetSection, resetWarning, updateAvailable, download, youHaveLatest, unableToCheckUpdates, newAction, name, context, textSelection, inputField, fullPage, all, promptPlaceholder, actionNamePlaceholder, presetNameExample, shortDescription, allActionsEnabled, allActionsDisabled, defaultActionsRestored, shortcutAdded, shortcutsSaved, fillAllFields, actionCustomCreated, allActionsHaveShortcuts

---

## [1.4.5] - 2025-11-27

### Improved
- **HTML interface translated**: options.html now uses i18n for all hardcoded text
- **New keys added**: iaProvider, apiKey, apiKeyHint, inlinePopup, contextMenuActions, essentials, practical, technical, analysis, translation, enableAll, disableAll, keyboardShortcuts, connectingToAI, viewDetails, etc.

---

## [1.4.4] - 2025-11-27

### Added
- **True streaming in popup**: character-by-character via chrome.runtime.connect
- **Options button**: gear in results.html to open extension options

### Improved
- **Auto-scroll**: popup auto-scrolls during streaming

---

## [1.4.3] - 2025-11-27

### Added
- **Advanced copy menu**: copy Markdown, Plain text, HTML from popup
- **View details without regenerating**: shows existing result instead of rerun

### Removed
- **“New tab” button**: removed from results.html

---

## [1.4.2] - 2025-11-27

### Added
- **Inline popup for context menu**: right-click actions show floating popup instead of new tab
- **Copy/View details buttons**: per action
- **Toggle option**: can disable inline popup to open new tab instead

### Fixed
- **currentConfig error**: fixed reference in service-worker

---

## [1.4.1] - 2025-11-27

### Fixed
- **Inline popup**: generation via background script to avoid CORS “Failed to fetch”
- **Config reload**: reload config before each call
- **Waiting message**: “Connecting to AI...” shown during wait

---

## [1.4.0] - 2025-11-27

### Added
- **Inline popup with streaming**: quick prompt response in floating popup with real-time streaming
- **“View details” button**: open result in new tab
- **“Copy” button**: copy response to clipboard
- **Toggle option**: disable inline popup to fallback to new tab

### Improved
- **UX**: no need to change tab for short answers

---

## [1.3.2] - 2025-11-27

### Fixed
- **Critical prompt bug**: default prompts shown correctly when editing
- **API key field CSS**: styled consistently
- **Shortcut conflict detection**: system/duplicate shortcut checks
- **Success message**: confirmation when saving shortcut

### Removed
- **Donation links**: removed PayPal links from sidebar/About

---

## [1.3.1] - 2025-11-27

### Fixed
- **Action buttons CSS**: edit/delete no longer overlap on custom actions
- **Translations complete**: missing keys added (shortcuts, custom actions) in 5 languages

---

## [1.3.0] - 2025-11-27

### Added
- **Prompt editing**: each action customizable
- **Edit button**: pencil icon per action
- **Visual indicator**: actions with modified prompt show asterisk (*)
- **Restore**: button to restore default prompt

### Improved
- Context menu and shortcuts use custom prompts

---

## [1.2.2] - 2025-11-27

### Fixed
- **Delete shortcut button**: correct position
- **Unified prompts**: keyboard shortcuts now use same prompts as context menu
- **Prompt sync**: custom action prompt updates shortcut prompt

---

## [1.2.1] - 2025-11-27

### Fixed
- **Dynamic version**: read from manifest.json (no hardcoded value)
- **Quick prompt**: window.open fallback if background message fails
- **Keyboard shortcuts**: missing prompts added (bullet_points, make_shorter, make_formal, make_casual, explain_code, review_code, debug_help)
- **Custom actions**: section moved to top of options page

---

## [1.2.0] - 2025-11-27

### Fixed
- **Custom action modal**: uses CSS classes instead of IDs to avoid conflicts
- **Quick prompt (Alt+I)**: fixed sending with selected text
- **Category actions**: Essentials/Practical/Technical/Analysis work correctly
- **Quick popup CSS**: input no longer overflows right side
- **Duplicate functions**: removed 133 lines duplicate code in options.js
- **Context menu**: added mutex to avoid duplicate IDs

### Changed
- **All prompts revised**: no markdown tables, simpler prompts, explicit “No tables”
- **Quick prompts**: summarize page/extract points without heavy formatting

---

## [1.1.0] - 2025-11-27

### Added
- **Multi-provider support**
  - Ollama (local, default)
  - OpenAI (GPT-4o, GPT-4-turbo, GPT-3.5-turbo)
  - Anthropic (Claude Sonnet 4, Claude 3.5 Sonnet, Claude 3 Haiku)
  - Groq (Llama 3.3 70B, Mixtral)
  - OpenRouter (multi-model access)
  - Custom (OpenAI-compatible)
- **Custom actions**
  - Create actions with custom prompts
  - Integrate into context menu
  - Manage (add/remove) from options
- **Dynamic keyboard shortcuts**
  - Assign shortcuts to any action/custom action/translation
  - Visual recording of combinations
- **Extended translations**
  - 12 languages (FR, EN, ES, DE, IT, PT, ZH, JA, KO, AR, RU, NL)
  - Toggle per language
  - Context menu integration
- **Update system**
  - Auto-check for new versions
  - Notification in options
  - Link to changelog

### Changed
- Options UI reorganized
- Provider handling with dynamic URL/API key
- Streaming adapted per provider (Ollama, OpenAI, Anthropic)

### Fixed
- Multiple content-script injections in iframes
- Popup actions that were broken

---

## [1.0.0] - 2025-11-26

### Added
- **Smart context menu**
  - Auto-detect context (selection, editable field, page)
  - Contextual actions
  - Programmatic content script injection for reliability
- **Multi-language translation**
  - 11 languages: FR, EN, ES, IT, PT, DE, NL, RU, ZH, JA, AR
  - Translate from context menu or input fields
  - Auto-detect source language
- **24 Professional presets (140+ actions)**
  - IT, Customer Support, Sales, Developer, Writer, Student, Researcher, HR/Recruiter, Manager, Legal, Marketing, PM, UX Designer, Data Analyst, Community Manager, Trainer, Translator, Journalist, Freelancer, Health, E-commerce, Copywriter, Content Creator, Personal Assistant
- **Full Markdown rendering**
  - Titles, bold/italic, code, lists, tables, code blocks with highlighting, quotes, links
- **Custom presets**
  - Create with custom actions
  - Edit prompts
  - Enable/disable individually
  - “Customize” button for built-in presets
- **User interface**
  - Multilingual UI (FR, EN, ES, IT, PT)
  - Options page with tabs
  - Results page with streaming
  - Visual loading indicator
  - Customization modal with scroll
- **Ollama integration**
  - Connect to local server
  - Auto-detect models
  - Real-time streaming
  - Configurable server URL
- **Other features**
  - “Report a bug” button with template
  - “Request a feature” template
  - Save user preferences
  - Quick actions (Summarize page, Extract key points)

### Technical
- Chrome Extension Manifest V3
- Service Worker for background
- Content Script for page interaction
- Storage API for persistence
- Scripting API for dynamic injection

---

## Versioning guide

### Format: MAJOR.MINOR.PATCH
- **MAJOR**: incompatible API changes
- **MINOR**: backward-compatible features
- **PATCH**: backward-compatible bug fixes

### Change types
- `Added` new features
- `Changed` updates to existing features
- `Deprecated` features to be removed
- `Removed` features removed
- `Fixed` bug fixes
- `Security` vulnerabilities fixed

---

[Unreleased]: https://github.com/Gohanado/ia-helper/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Gohanado/ia-helper/releases/tag/v2.0.0
[1.5.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.5.0
[1.4.9]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.9
[1.4.8]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.8
[1.4.7]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.7
[1.4.6]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.6
[1.4.5]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.5
[1.4.4]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.4
[1.4.3]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.3
[1.4.2]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.2
[1.4.1]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.1
[1.4.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.0
[1.3.2]: https://github.com/Gohanado/ia-helper/releases/tag/v1.3.2
[1.3.1]: https://github.com/Gohanado/ia-helper/releases/tag/v1.3.1
[1.3.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.3.0
[1.2.2]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.2
[1.2.1]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.1
[1.2.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.0
[1.1.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.1.0
[1.0.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.0.0
