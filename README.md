# IA Helper

Extension Chrome d'assistant IA intelligent connectee a Ollama. Toutes vos donnees restent **100% locales** sur votre machine.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Gohanado/ia-helper/releases)
[![License](https://img.shields.io/badge/license-Source%20Available-orange.svg)](LICENSE)
[![Chrome](https://img.shields.io/badge/chrome-88%2B-yellow.svg)](https://www.google.com/chrome/)
[![Gratuit](https://img.shields.io/badge/prix-gratuit-brightgreen.svg)]()
[![Sans Pub](https://img.shields.io/badge/pubs-aucune-brightgreen.svg)]()

---

## Soutenir le Projet

IA Helper est **100% gratuit** et **sans publicites**. Si vous appreciez le projet, vous pouvez le soutenir:

| Plateforme | Lien |
|------------|------|
| Ko-fi | [Faire un don](https://ko-fi.com/gohanado) |
| PayPal | [Faire un don](https://paypal.me/gohanado) |
| GitHub Sponsors | [Devenir sponsor](https://github.com/sponsors/Gohanado) |

Chaque don aide a maintenir et ameliorer le projet!

---

## Fonctionnalites principales

| Fonctionnalite | Description |
|----------------|-------------|
| Menus contextuels intelligents | Actions adaptees au contexte (selection, champ de saisie, page) |
| Traduction multi-langues | 11 langues supportees (FR, EN, ES, IT, PT, DE, NL, RU, ZH, JA, AR) |
| **24 presets professionnels** | Plus de 140 actions specialisees par metier |
| Presets personnalises | Creez et personnalisez vos propres ensembles d'actions |
| Streaming en temps reel | Reponses affichees progressivement dans les champs de saisie |
| Interface multilingue | Interface disponible en 5 langues (FR, EN, ES, IT, PT) |
| 100% local et prive | Aucune donnee envoyee a des serveurs externes |
| Rendu Markdown | Affichage formate des reponses IA |

---

## Installation

### Prerequis

- [Ollama](https://ollama.ai/) installe et en cours d'execution
- Au moins un modele telecharge (ex: `ollama pull llama3.2` ou `ollama pull mistral`)
- Google Chrome version 88 ou superieure

### Etapes d'installation

1. **Clonez le depot**
   ```bash
   git clone https://github.com/Gohanado/ia-helper.git
   ```

2. **Ouvrez Chrome et accedez aux extensions**
   ```
   chrome://extensions/
   ```

3. **Activez le mode developpeur**
   - Cliquez sur le toggle "Mode developpeur" en haut a droite

4. **Chargez l'extension**
   - Cliquez sur "Charger l'extension non empaquetee"
   - Selectionnez le dossier `ia-helper`

5. **Configurez l'extension**
   - Cliquez sur l'icone IA Helper dans la barre d'outils
   - Allez dans Options pour configurer Ollama

## Configuration

### Connexion a Ollama

1. Assurez-vous qu'Ollama est en cours d'execution (`ollama serve`)
2. Ouvrez les options de IA Helper
3. L'URL par defaut est `http://localhost:11434`
4. Cliquez sur "Tester la connexion"
5. Selectionnez votre modele prefere dans la liste

### Personnalisation

- **Langue de l'interface**: Choisissez parmi FR, EN, ES, IT, PT
- **Langue des reponses**: Forcez les reponses dans une langue specifique
- **Presets actifs**: Activez/desactivez les presets selon vos besoins
- **Prompts personnalises**: Modifiez les prompts de chaque action

## Utilisation

### Menu contextuel (clic droit)

| Contexte | Actions disponibles |
|----------|---------------------|
| Texte selectionne | Analyser, Resumer, Expliquer, Traduire |
| Champ de saisie | Corriger, Reformuler, Developper, Simplifier, Traduire |
| Page entiere | Resumer la page, Extraire les points essentiels |
| Partout | Traduction (11 langues), Actions rapides |

### 24 Presets Professionnels (140+ actions)

| Categorie | Presets |
|-----------|---------|
| **Tech** | Support IT, Developpeur, Data Analyst |
| **Business** | Commercial, Marketing, Product Manager, Freelance |
| **Communication** | Service Client, Community Manager, Copywriter |
| **Creatif** | Redacteur, Designer UX, Createur Contenu, Journaliste |
| **Education** | Etudiant, Formateur, Chercheur |
| **Specialise** | RH/Recruteur, Manager, Juriste, Traducteur, Sante, E-commerce |
| **Personnel** | Assistant Personnel |

### Presets personnalises

1. Allez dans Options > Presets
2. Cliquez sur "Creer un preset"
3. Ajoutez vos actions avec leurs prompts
4. Sauvegardez et activez le preset

Vous pouvez aussi personnaliser les presets integres via le bouton "Personnaliser".

## Structure du projet

```
ia-helper/
├── manifest.json              # Configuration Chrome Extension Manifest V3
├── README.md                  # Documentation principale
├── CHANGELOG.md               # Historique des versions
├── LICENSE                    # Licence MIT
├── package.json               # Dependances Node.js
│
├── src/
│   ├── background/            # Service Worker (gestion menus, messages)
│   │   └── service-worker.js
│   ├── content/               # Content Script (injection dans les pages)
│   │   ├── content-script.js
│   │   └── content-styles.css
│   ├── popup/                 # Interface popup (acces rapide)
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── options/               # Page d'options (configuration complete)
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   ├── results/               # Page de resultats (affichage streaming)
│   │   ├── results.html
│   │   ├── results.css
│   │   └── results.js
│   └── i18n/                  # Internationalisation
│       └── translations.js
│
├── assets/
│   └── icons/                 # Icones de l'extension (16, 32, 48, 128px)
│
├── docs/                      # Documentation supplementaire
│   └── README.md
│
└── scripts/                   # Scripts utilitaires
    ├── create-icons.js
    └── generate-icons.html
```

## Technologies utilisees

- **Chrome Extension Manifest V3** - API moderne des extensions Chrome
- **JavaScript ES6+** - Aucun framework, code natif
- **CSS3** - Design moderne avec variables CSS
- **Ollama API** - Integration locale avec les modeles IA

## Contribuer

Les contributions sont les bienvenues! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les details.

### Comment participer?

| Action | Lien |
|--------|------|
| Signaler un bug | [Ouvrir une issue](https://github.com/Gohanado/ia-helper/issues/new?labels=bug&template=bug_report.md) |
| Proposer une feature | [Feature request](https://github.com/Gohanado/ia-helper/issues/new?labels=enhancement&template=feature_request.md) |
| Soumettre du code | [Guide de contribution](CONTRIBUTING.md) |

### Contributeurs

Voir [CONTRIBUTORS.md](CONTRIBUTORS.md) pour la liste des contributeurs.

---

## Licence

**IA Helper License** - Source Available avec restriction commerciale.

| Usage | Autorise |
|-------|----------|
| Personnel | Gratuit et libre |
| Commercial/Pro | Autorisation requise |
| Modification perso | Gratuit et libre |
| Redistribution commerciale | Interdit sans accord |

Voir [LICENSE](LICENSE) pour les details complets.

Pour usage commercial: contact@badom.ch

---

## Confidentialite

IA Helper respecte votre vie privee. Voir [PRIVACY.md](PRIVACY.md).

**En resume:**
- Aucune donnee collectee
- Aucun serveur externe
- 100% local sur votre machine
- Aucun tracking, aucune pub

---

## Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet des versions.

---

## Liens

| Ressource | Lien |
|-----------|------|
| Documentation | [docs/README.md](docs/README.md) |
| Signaler un bug | [GitHub Issues](https://github.com/Gohanado/ia-helper/issues) |
| Soutenir le projet | [Ko-fi](https://ko-fi.com/gohanado) |
| Contact | contact@badom.ch |

---

## Auteur

Developpe par [Gohanado](https://github.com/Gohanado)

---

**IA Helper** - L'IA a portee de clic, 100% locale et privee. Gratuit, sans pub, pour toujours.

