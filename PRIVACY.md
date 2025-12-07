# Privacy Policy - IA Helper

**Last update:** December 7, 2025

## Summary
IA Helper works entirely locally. We do not collect, store, or send personal data to external servers. Your data stays on your machine, except when you explicitly call an external AI provider you configured.

---

## 1. Data Collected
### We do **not** collect:
- Personal data
- Browsing history
- Texts processed by the AI
- Identifiers or tracking cookies
- Telemetry or usage analytics

### Data stored locally (your machine only):
- Extension settings (provider URLs, selected model, languages)
- Custom presets and prompts
- Interface preferences

Storage: `chrome.storage.local` (local to your browser profile).

---

## 2. Network Communication
### Possible connections
| Destination | Purpose | Data sent |
|-------------|---------|-----------|
| `localhost:11434` (Ollama, default) | Local AI processing | Text you ask to process |
| External provider (OpenAI/Anthropic/Groq/OpenRouter/custom) if configured | AI processing | Text you ask to process |
| github.com (only if you click bug/feedback links) | Issue templates | None automatically |

No tracking/ads/analytics calls are made by the extension.

---

## 3. AI Processing
- With Ollama, everything stays on your machine.
- With cloud providers, your text goes only to the provider you chose.
- No data is sent anywhere else.

---

## 4. Permissions
| Permission | Use |
|------------|-----|
| `contextMenus` | Right-click menu |
| `activeTab` | Read selected text |
| `storage` | Save preferences locally |
| `scripting` | Inject features on pages |
| `<all_urls>` | Allow actions on any site (no data collection) |

---

## 5. Data Sharing
We do not sell or share data with third parties.

---

## 6. Security
- Open source, auditable code
- No external telemetry
- No minification for transparency

---

## 7. Your Rights
- Remove the extension at any time.
- Reset options from the settings page.
- Inspect the source code on GitHub.

---

## 8. Changes
Changes to this policy are documented in the changelog and on GitHub.

---

## 9. Contact
- Email: contact@badom.ch  
- GitHub: https://github.com/Gohanado/ia-helper/issues

---

## 10. Compliance
- GDPR principles (data minimization, user control)
- Chrome Web Store policies

**IA Helper keeps your privacy first.**
