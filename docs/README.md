# Documentation IA Helper

## Guide de demarrage rapide

### 1. Installation d'Ollama

Telechargez et installez Ollama depuis [ollama.ai](https://ollama.ai/).

Telechargez un modele:
```bash
ollama pull llama3
# ou
ollama pull mistral
# ou
ollama pull gemma
```

### 2. Installation de l'extension

1. Telechargez ou clonez ce depot
2. Ouvrez Chrome et allez sur `chrome://extensions/`
3. Activez "Mode developpeur"
4. Cliquez "Charger l'extension non empaquetee"
5. Selectionnez le dossier ia-helper

### 3. Configuration initiale

1. Cliquez sur l'icone IA Helper dans la barre d'outils
2. Ouvrez les Options
3. Verifiez que l'URL Ollama est correcte (par defaut: http://localhost:11434)
4. Cliquez "Tester la connexion"
5. Selectionnez votre modele prefere
6. Sauvegardez

## Fonctionnalites

### Menus contextuels

**Selection de texte:**
- Resumer le texte selectionne
- Traduire (multi-langues)
- Expliquer simplement
- Extraire les points cles
- Analyser le sentiment

**Champs de saisie:**
- Corriger les erreurs
- Reformuler en mail professionnel
- Developper le contenu
- Ameliorer le style

**Page entiere:**
- Resumer la page
- Extraire les informations principales

### Presets professionnels

Activez des ensembles d'actions adaptes a votre metier:

| Preset | Actions |
|--------|---------|
| Support IT | Resume ticket, Suggestion solution, Reponse pro |
| Service Client | Analyse sentiment, Reponse empathique |
| Developpeur | Expliquer code, Revue de code, Debug |
| Commercial | Analyse prospect, Argumentaire, Email suivi |
| Redacteur | Ameliorer style, SEO, Titres accrocheurs |
| Etudiant | Expliquer simplement, Resume revision |
| Chercheur | Points cles, Identifier biais, Resume article |

### Presets personnalises

Creez vos propres presets avec des actions sur mesure:
1. Allez dans Options > Presets
2. Cliquez "Creer un preset"
3. Nommez votre preset
4. Ajoutez des actions avec leurs prompts personnalises

## Depannage

### L'extension ne se connecte pas

1. Verifiez qu'Ollama est en cours d'execution
2. Testez dans le terminal: `curl http://localhost:11434/api/tags`
3. Verifiez qu'aucun pare-feu ne bloque le port 11434

### Les menus n'apparaissent pas

1. Rechargez l'extension dans chrome://extensions
2. Rafraichissez la page web
3. Verifiez la console pour les erreurs (F12)

### Reponses lentes

- Essayez un modele plus leger (gemma, phi)
- Verifiez les ressources de votre machine
- Desactivez le streaming pour les reponses courtes

## Support

- [Signaler un bug](https://github.com/Gohanado/ia-helper/issues/new)
- [Discussions](https://github.com/Gohanado/ia-helper/discussions)

