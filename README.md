# IA Helper

Assistant IA intelligent pour Chrome connecte a Ollama.

## Fonctionnalites

- **Menus contextuels intelligents** - Actions adaptees au contexte (selection, champ de saisie, page)
- **Traduction multi-langues** - FR, EN, ES, IT, PT et plus
- **Presets professionnels** - Actions specialisees par metier (Support IT, Commercial, Developpeur, etc.)
- **Presets personnalises** - Creez vos propres ensembles d'actions
- **Streaming en temps reel** - Reponses affichees progressivement
- **100% local** - Vos donnees restent sur votre machine via Ollama

## Installation

### Prerequis

1. [Ollama](https://ollama.ai/) installe et en cours d'execution
2. Au moins un modele telecharge (`ollama pull llama3` ou autre)
3. Google Chrome (version 88+)

### Installation de l'extension

1. Clonez ce depot ou telechargez le ZIP
2. Ouvrez `chrome://extensions/` dans Chrome
3. Activez le "Mode developpeur" (en haut a droite)
4. Cliquez sur "Charger l'extension non empaquetee"
5. Selectionnez le dossier `ia-helper`

## Configuration

1. Cliquez sur l'icone IA Helper ou faites clic droit > IA Helper > Options
2. Configurez l'URL du serveur Ollama (par defaut: `http://localhost:11434`)
3. Testez la connexion et selectionnez votre modele
4. Activez les presets souhaites

## Utilisation

### Menu contextuel

- **Sur du texte selectionne**: Resumer, Traduire, Expliquer, Analyser
- **Dans un champ de saisie**: Corriger, Reformuler, Developper
- **Sur une page**: Resumer la page, Extraire les points cles

### Presets

Activez des ensembles d'actions specialises:
- Support IT
- Service Client
- Commercial
- Developpeur
- Redacteur
- Etudiant
- Chercheur

## Structure du projet

```
ia-helper/
├── manifest.json          # Configuration Chrome Extension
├── src/
│   ├── background/        # Service Worker
│   ├── content/           # Content Script
│   ├── popup/             # Interface popup
│   ├── options/           # Page d'options
│   ├── results/           # Page de resultats
│   ├── config/            # Configuration et presets
│   ├── i18n/              # Traductions
│   └── docs/              # Documentation
└── assets/
    └── icons/             # Icones de l'extension
```

## Contribuer

Les contributions sont les bienvenues! N'hesitez pas a ouvrir une issue ou une pull request.

## Signaler un bug

[Ouvrir une issue sur GitHub](https://github.com/Gohanado/ia-helper/issues/new)

## Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de details.

