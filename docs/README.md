# IA Helper Documentation

Technical and user guide for the Chrome/Firefox extension.

## Table of contents
1. Quick start
2. Providers
3. Local LLM (Ollama)
4. Remote Ollama (VPS/VM)
5. Advanced configuration
6. Features
7. API & architecture
8. Troubleshooting
9. FAQ

---

## Quick start
IA Helper works with multiple providers. Easiest path: Ollama locally. You can also use OpenAI, Anthropic, Groq, OpenRouter, or any OpenAI-compatible endpoint.

### 3-minute local setup (recommended)
1. Install Ollama: https://ollama.ai/download  
2. Pull a model: `ollama pull llama3.2` (or another)  
3. Install the extension (dev mode or store)  
4. Options: provider = Ollama, URL = `http://localhost:11434`, test connection  
5. Use the context menu or chat.

### Using a cloud provider
1. Choose provider in Options (OpenAI, Anthropic, Groq, OpenRouter, custom)
2. Enter URL/API key (per provider doc)
3. Pick a model (badge in chat/popup)
4. Save; all actions route to that provider.

### Providers available
- **Ollama (local)**: free, local data
- **OpenAI / OpenRouter / Custom**: OpenAI-compatible API
- **Anthropic / Groq**: streaming + system/user roles

---

## Install a local LLM (Ollama)
See https://ollama.ai/download and:
- Windows: run installer, then `ollama pull llama3.2`
- macOS: `brew install ollama`, then pull a model
- Linux: `curl -fsSL https://ollama.ai/install.sh | sh`, start service, then pull a model

Suggested models: `llama3.2` (general), `mistral` (very good FR), `gemma2`, `phi3`, `qwen2.5`.

---

## Remote Ollama (server)
Install Ollama on a VPS/VM, expose port 11434 (use HTTPS/reverse proxy for production).
Example (Linux):
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2
# Listen on all interfaces
sudo mkdir -p /etc/systemd/system/ollama.service.d
cat <<EOF | sudo tee /etc/systemd/system/ollama.service.d/override.conf
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
EOF
sudo systemctl daemon-reload
sudo systemctl restart ollama
```
Open firewall port 11434. In IA Helper options, set URL to `http://YOUR_IP:11434`.

Docker (alternative):
```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
# NVIDIA
docker run -d --gpus=all -p 11434:11434 --name ollama ollama/ollama
docker exec -it ollama ollama pull llama3.2
```

---

## Install the extension
### Dev mode
```bash
git clone https://github.com/Gohanado/ia-helper.git
```
1. Chrome: `chrome://extensions`, enable dev mode, “Load unpacked”, select repo folder.  
2. Firefox: `about:debugging#/runtime/this-firefox`, “Load temporary add-on”, pick `manifest.json` from the repo folder.

### Configuration
1. Click the IA Helper icon
2. Check status is OK
3. Open Options to set provider/model/language/etc.

---

## Advanced configuration
Connection:
| Setting | Description | Default |
|---------|-------------|---------|
| Ollama URL | Server URL | http://localhost:11434 |
| Model | Model to use | (first available) |
| Streaming | Progressive responses | Enabled |

Language:
| Setting | Description | Options |
|---------|-------------|---------|
| Interface language | UI language | EN, FR, ES, IT, PT |
| Response language | Force responses in | Auto, EN, FR, ES, IT, PT |

Custom prompts:
1. Options > Presets
2. Customize a preset or action
3. Save
Available tokens: `{lang}` for translation targets; user text is added automatically.

---

## Features
### Context menu
Adapts to context:
- **Selection**: summarize, explain, analyze, translate, extract key points
- **Input fields**: correct, rephrase, expand, simplify, translate/replace
- **Page**: summarize page, extract key points, page actions

### Presets (140+ actions)
Tech (Dev, Data), Business (Sales, Marketing, PM), Communication (Support, Community, Copy), Creative (Writer, UX, Content), Education (Student, Teacher), Specialized (HR, Manager, Legal, Health, E-commerce), Personal assistant.

### Popup inline
Streaming, copy, TTS, stop, view details.

### Chat
Local history, export, multi-format copy, TTS, model/agent selector, suggestions.

### Agents
Create/duplicate with system prompt, temperature, top_p, penalties, model per agent.

### Rendering
Markdown, LaTeX, code blocks with copy buttons.

---

## API & architecture
Key files:
```
src/
  background/service-worker.js  # menus, messaging, injection
  content/content-script.js     # page interaction
  popup/                        # popup UI
  options/                      # settings UI
  results/                      # streaming results page
  i18n/translations.js          # translations
```

Data storage (`chrome.storage.local`):
| Key | Description |
|-----|-------------|
| config | URL, model, languages, options |
| activePresets | Enabled presets |
| customPresets | User presets |
| customPrompts | User-modified prompts |

---

## Troubleshooting
- **Cannot connect to Ollama**: ensure service running; `curl http://localhost:11434/api/tags`; check firewall.
- **Context menu empty**: reload extension, refresh page, check SW console.
- **Actions fail**: set a model; check console logs “IA Helper”.
- **Slow responses**: choose lighter model (`phi3`, `gemma:2b`); ensure CPU/RAM available.
- **“No content to process”**: select text or ensure input has text.

---

## FAQ
**Is my data sent over the Internet?**  
Local with Ollama. With cloud providers, only to the provider you configured.

**Recommended models?**  
`mistral` or `llama3.2` for general use; `phi3`/`gemma:2b` for speed.

**Firefox support?**  
Supported (Manifest V3 build); popup inline long-generation issue under investigation.

---

## Support
- Bugs: https://github.com/Gohanado/ia-helper/issues/new?template=bug_report.md  
- Features: https://github.com/Gohanado/ia-helper/issues/new?template=feature_request.md  
- Discussions: https://github.com/Gohanado/ia-helper/discussions  
- Donate: https://paypal.me/gohanado

---

**Version:** 2.0.0  
**Last updated:** 2025-12-08
