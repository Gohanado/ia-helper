# Publication Chrome Web Store

## Informations requises

### Nom de l'extension
```
IA Helper - Assistant IA Multi-Providers
```

### Description courte (132 caracteres max)
```
Assistant IA multi-providers (Ollama local, OpenAI, Anthropic, Groq, OpenRouter). Menu clic droit, popup inline, chat, agents.
```

### Description longue
```
IA Helper - Votre assistant IA multi-providers dans le navigateur

Choisissez votre LLM (local ou cloud) et utilisez-le en un clic droit, dans un popup inline ou dans un chat complet. Support Ollama (local), OpenAI, Anthropic, Groq, OpenRouter et endpoints compatibles OpenAI.

FONCTIONNALITES PRINCIPALES
- Menu contextuel intelligent (selection, champ, page) avec 140+ actions et actions personnalisees
- Popup inline avec streaming, copie, TTS, stop, voir en detail
- Chat complet avec historique local, export, TTS, copie multi-formats, selector modele/agent
- Agents IA personnalises (prompts, temperature, top_p, penalties, modele par agent)
- Rendu Markdown/LaTeX et code blocks avec bouton copie
- UI et traductions completes (FR, EN, ES, IT, PT)

PRESETS PROFESSIONNELS (140+ actions)
- Developpeur : code review, explication, debug
- Redacteur : reformulation, resume, style
- Support/Service client : reponses, satisfaction
- Analyste/Manager : synthese, plan d’action
- Plus de 20 autres profils metiers

CONFIDENTIALITE
- Mode local (Ollama) sans fuite de donnees
- Aucun tracking, aucune telemetrie
- Pour les providers cloud, seules vos requetes API sont envoyees au provider choisi

OPEN SOURCE
Code source disponible sur GitHub. Contributions bienvenues.
```

### Categorie
```
Productivite
```

### Langues
- Francais (principal)
- Anglais
- Espagnol
- Italien
- Portugais

---

## Assets requis

### Icones (deja pretes)
- [x] icon16.png (16x16)
- [x] icon32.png (32x32)
- [x] icon48.png (48x48)
- [x] icon128.png (128x128)

### A creer
- [ ] Capture d'ecran 1: Menu contextuel (1280x800)
- [ ] Capture d'ecran 2: Page de resultats (1280x800)
- [ ] Capture d'ecran 3: Page d'options (1280x800)
- [ ] Capture d'ecran 4: Popup (1280x800)
- [ ] Icone promotionnelle (440x280)

---

## Checklist publication

- [x] manifest.json valide
- [x] Permissions justifiees
- [x] Politique de confidentialite (PRIVACY.md)
- [x] Licence claire
- [x] Documentation complete
- [x] Code propre et commente
- [ ] Screenshots prepares
- [ ] Icone promo preparee
- [ ] Compte developpeur Chrome ($5 one-time)
- [ ] ZIP de publication genere

---

## Commande pour generer le ZIP

```powershell
Remove-Item ia-helper-v1.0.0.zip -ErrorAction SilentlyContinue
Compress-Archive -Path "manifest.json", "src", "assets" -DestinationPath "ia-helper-chrome-v2.0.0.zip" -Force
```

---

## Liens utiles

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [Guide de publication](https://developer.chrome.com/docs/webstore/publish/)
- [Politiques du store](https://developer.chrome.com/docs/webstore/program_policies/)

