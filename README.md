# IA Helper

Extension navigateur multi-providers (Ollama, OpenAI, Anthropic, Groq, OpenRouter, provider compatible OpenAI) avec menu contextuel intelligent, popup inline, chat complet, agents personnalisables et TTS.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Gohanado/ia-helper/releases)
[![License](https://img.shields.io/badge/license-Source%20Available-orange.svg)](LICENSE)
[![Chrome](https://img.shields.io/badge/chrome-88%2B-yellow.svg)](https://www.google.com/chrome/)
[![Firefox](https://img.shields.io/badge/firefox-109%2B-orange.svg)](https://www.mozilla.org/firefox/)
[![Gratuit](https://img.shields.io/badge/prix-gratuit-brightgreen.svg)]()

---

## Pourquoi IA Helper ?

Marre de payer pour chaque requete IA. IA Helper vous laisse choisir votre LLM (local ou cloud) et l’utiliser directement dans le navigateur: clic droit, popup inline, chat, agents, actions pro. Compatible Chrome et Firefox.

---

## Fonctionnalites clefs

- Menu contextuel intelligent (selection, champ, page) avec plus de 140 actions et actions personnalisees
- Popup inline avec streaming, copie, TTS, stop, voir en detail
- Chat complet avec historique local, export, TTS, copy options, model/agent selector
- Agents personnalises (prompts, temperature, top_p, penalties, modele par agent)
- Multi-providers: Ollama (local), OpenAI, Anthropic, Groq, OpenRouter, provider custom
- Rendu Markdown, LaTeX, code blocks avec copie
- UI et traductions completes (FR, EN, ES, IT, PT) + menu contextuel traduit
- Builds Chrome/Firefox dedies avec scripts d’empaquetage

---

## Installation (mode developpeur)

### Chrome
1. Telechargez `ia-helper-chrome-v2.0.0.zip` depuis les Releases.
2. Extrayez le ZIP.
3. Ouvrez `chrome://extensions`, activez le mode developpeur, puis “Charger l’extension non empaquetee” et selectionnez le dossier extrait.

### Firefox
1. Telechargez `ia-helper-firefox-v2.0.0.zip` depuis les Releases.
2. Ouvrez `about:debugging#/runtime/this-firefox`, “Charger un module complementaire temporaire”, choisissez `manifest.json` du dossier extrait.

---

## Demarrage rapide avec un LLM local (Ollama)

1. Installez Ollama : [ollama.ai/download](https://ollama.ai/download) (Windows/Mac/Linux).
2. Telechargez un modele : `ollama pull llama3.2` (ou tout autre modele).
3. Dans IA Helper > Options, choisissez provider `Ollama`, laissez `http://localhost:11434`, testez la connexion.
4. C’est pret : utilisez le menu contextuel ou le chat.

Pour un serveur distant (VPS/VM), exposez Ollama sur une URL securisee et remplacez l’URL dans les Options.

---

## Utilisation

- **Menu contextuel** : clic droit > IA Helper > actions (texte selectionne, champ editable, page, traductions, actions perso).
- **Popup inline** : prompt rapide avec streaming; bouton Stop, Copier, Lire, Voir en detail.
- **Chat** : historique local, export, suppression multiple, suggestions, TTS, copie multi-formats, switch modele/agent.
- **Agents** : onglet Agents dans les Options pour creer/dupliquer/configurer prompts et hyperparametres par agent.
- **Langues** : interface et menus en 5 langues, langue de reponse forcable (sauf actions de traduction explicites).

---

## Scripts de build

- `npm run package` : genere les packages Chrome et Firefox (scripts dans `scripts/`).
- `scripts/build-packages.ps1` ou `build-packages.js` : empaquetage automatique (dist/chrome et dist/firefox).
- Les artefacts ZIP sont ignores par git (`dist/`, `*.zip`). Generer puis uploader pour les releases.

---

## Confidentialite

Les donnees restent dans le navigateur. Aucune telemetrie. Pour les providers cloud, seules vos requetes/API keys sont envoyees au provider choisi.

---

## Support et contributions

- Issues: https://github.com/Gohanado/ia-helper/issues  
- Contributions: voir [CONTRIBUTING.md](CONTRIBUTING.md)  
- Dons: [Paypal](https://paypal.me/gohanado)

---

## Licence

Source Available (voir [LICENSE](LICENSE)).
