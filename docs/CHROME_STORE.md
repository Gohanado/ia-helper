# Chrome Web Store Listing

## Required info

### Extension name
```
IA Helper - Multi-Provider AI Assistant
```

### Short description (<=132 chars)
```
Multi-provider AI assistant (Ollama local, OpenAI, Anthropic, Groq, OpenRouter). Context menu, inline popup, chat, agents.
```

### Long description
```
IA Helper - Your multi-provider AI assistant in the browser

Choose your LLM (local or cloud) and use it via right-click, inline popup, or full chat. Supports Ollama (local), OpenAI, Anthropic, Groq, OpenRouter, and OpenAI-compatible endpoints.

MAIN FEATURES
- Smart context menu (selection/input/page) with 140+ actions and custom actions
- Inline popup with streaming, copy, TTS, stop, view details
- Full chat with local history, export, TTS, multi-format copy, model/agent selector
- Custom AI agents (prompts, temperature, top_p, penalties, model per agent)
- Markdown/LaTeX rendering and code blocks with copy
- Full translations (EN, FR, ES, IT, PT)

PRO PRESETS (140+ actions)
- Developer: code review, explain, debug
- Writer: rephrase, summarize, style
- Support/Customer: replies, satisfaction
- Analyst/Manager: synthesis, action plans
- Plus 20+ more professional profiles

PRIVACY
- Local mode (Ollama) keeps data on your machine
- No tracking/telemetry
- For cloud providers, only your API requests are sent to the provider you choose

OPEN SOURCE
Source available on GitHub. Contributions welcome.
```

### Category
```
Productivity
```

### Languages
- English (primary)
- French
- Spanish
- Italian
- Portuguese

### Privacy policy URL
https://github.com/Gohanado/ia-helper/blob/main/PRIVACY.md

### Permission justifications
`contextMenus`: show right-click menu  
`activeTab`: read selected text  
`storage`: save local preferences (provider, model, language, shortcuts)  
`scripting`: inject content script to interact with pages  
`<all_urls>`: allow actions on any site (no data collection)

### Screenshots (1280x800 or 640x400)
1. Context menu with AI actions
2. Inline popup UI
3. Options/configuration page
4. Streaming response
5. Results page with Markdown rendering

### Uploads
- Use `dist/ia-helper-chrome-v{version}.zip` for store upload.
