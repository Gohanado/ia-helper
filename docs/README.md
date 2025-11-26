# Documentation IA Helper

Documentation technique et guide utilisateur complet pour l'extension IA Helper.

## Table des matieres

1. [Guide de demarrage rapide](#guide-de-demarrage-rapide)
2. [Configuration avancee](#configuration-avancee)
3. [Fonctionnalites detaillees](#fonctionnalites-detaillees)
4. [API et architecture](#api-et-architecture)
5. [Depannage](#depannage)
6. [FAQ](#faq)

---

## Guide de demarrage rapide

### Etape 1: Installation d'Ollama

Telechargez et installez Ollama depuis [ollama.ai](https://ollama.ai/).

```bash
# Telecharger un modele (choisissez selon vos besoins)
ollama pull llama3.2      # Modele equilibre, recommande
ollama pull mistral       # Bon pour le francais
ollama pull gemma2        # Leger et rapide
ollama pull phi3          # Tres leger

# Verifier que le serveur fonctionne
ollama serve
```

### Etape 2: Installation de l'extension

```bash
# Cloner le depot
git clone https://github.com/Gohanado/ia-helper.git
```

1. Ouvrez Chrome et allez sur `chrome://extensions/`
2. Activez "Mode developpeur" (toggle en haut a droite)
3. Cliquez "Charger l'extension non empaquetee"
4. Selectionnez le dossier `ia-helper`

### Etape 3: Configuration initiale

1. Cliquez sur l'icone IA Helper dans la barre d'outils Chrome
2. Cliquez sur "Options" ou faites clic droit > IA Helper > Ouvrir les options
3. Dans l'onglet "Connexion":
   - URL Ollama: `http://localhost:11434` (par defaut)
   - Cliquez "Tester la connexion"
   - Selectionnez votre modele prefere
4. Dans l'onglet "Presets":
   - Activez les presets selon votre profil
5. Cliquez "Sauvegarder"

---

## Configuration avancee

### Parametres de connexion

| Parametre | Description | Valeur par defaut |
|-----------|-------------|-------------------|
| URL Ollama | Adresse du serveur Ollama | http://localhost:11434 |
| Modele | Modele IA a utiliser | (premier disponible) |
| Streaming | Affichage progressif des reponses | Active |

### Parametres de langue

| Parametre | Description | Options |
|-----------|-------------|---------|
| Langue interface | Langue des menus et options | FR, EN, ES, IT, PT |
| Langue reponses | Force les reponses dans une langue | Auto, FR, EN, ES, IT, PT |

### Personnalisation des prompts

Chaque action peut avoir son prompt personnalise:

1. Allez dans Options > Presets
2. Cliquez "Personnaliser" sur un preset
3. Modifiez le prompt de l'action souhaitee
4. Sauvegardez

**Variables disponibles dans les prompts:**
- `{lang}` - Langue cible pour les traductions
- Le texte utilisateur est automatiquement ajoute

---

## Fonctionnalites detaillees

### Menu contextuel

Le menu contextuel s'adapte automatiquement au contexte:

#### Sur du texte selectionne
| Action | Description |
|--------|-------------|
| Resumer | Resume concis du texte |
| Expliquer | Explication simple et claire |
| Analyser | Analyse du contenu et du ton |
| Traduire | Traduction vers 11 langues |
| Extraire | Points cles et informations principales |

#### Dans un champ de saisie (input/textarea)
| Action | Description |
|--------|-------------|
| Corriger | Correction orthographe et grammaire |
| Reformuler | Version plus professionnelle |
| Developper | Enrichit et detaille le texte |
| Simplifier | Version plus simple et claire |
| Traduire | Traduction avec remplacement |

#### Sur une page
| Action | Description |
|--------|-------------|
| Resumer la page | Resume du contenu principal |
| Extraire les points essentiels | Liste des informations cles |

### Presets professionnels

#### Support IT
- Resume de ticket technique
- Suggestion de solutions
- Redaction de reponse professionnelle
- Diagnostic de probleme

#### Service Client
- Analyse du sentiment client
- Reponse empathique
- Gestion de reclamation
- Suivi de demande

#### Commercial
- Analyse de prospect
- Argumentaire personnalise
- Email de relance
- Proposition commerciale

#### Developpeur
- Explication de code
- Revue de code (code review)
- Debug et correction
- Documentation

#### Redacteur
- Amelioration du style
- Optimisation SEO
- Titres accrocheurs
- Reformulation

#### Etudiant
- Explication simple
- Fiche de revision
- Resume structure
- Questions de comprehension

#### Chercheur
- Extraction des points cles
- Identification des biais
- Resume d'article scientifique
- Synthese de sources

---

## API et architecture

### Structure des fichiers

```
src/
├── background/
│   └── service-worker.js    # Gestion menus, messages, injection
├── content/
│   ├── content-script.js    # Interaction avec les pages
│   └── content-styles.css   # Styles injectes
├── popup/
│   ├── popup.html/js/css    # Interface popup
├── options/
│   ├── options.html/js/css  # Page d'options
├── results/
│   ├── results.html/js/css  # Page de resultats streaming
└── i18n/
    └── translations.js      # Traductions multilingues
```

### Communication entre composants

```
[Page Web] <--> [Content Script] <--> [Service Worker] <--> [Ollama API]
                      |
                      v
               [Results Page]
```

### Stockage des donnees

Toutes les donnees sont stockees localement via `chrome.storage.local`:

| Cle | Description |
|-----|-------------|
| config | Configuration generale (URL, modele, langues) |
| activePresets | Liste des presets actives |
| customPresets | Presets personnalises de l'utilisateur |
| customPrompts | Prompts modifies par l'utilisateur |

---

## Depannage

### L'extension ne se connecte pas a Ollama

1. **Verifiez qu'Ollama est demarre**
   ```bash
   ollama serve
   ```

2. **Testez la connexion manuellement**
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. **Verifiez le pare-feu**
   - Le port 11434 doit etre accessible
   - Desactivez temporairement le pare-feu pour tester

4. **Probleme CORS**
   - Ollama gere automatiquement CORS depuis la version 0.1.14

### Le menu contextuel est vide

1. Rechargez l'extension dans `chrome://extensions/`
2. Rafraichissez la page web (F5)
3. Ouvrez la console du Service Worker pour voir les erreurs

### Les actions ne fonctionnent pas

1. Verifiez que le modele est configure dans les options
2. Ouvrez la console de la page (F12) et cherchez les erreurs "IA Helper"
3. Verifiez la console du Service Worker

### Reponses lentes

- Utilisez un modele plus leger: `phi3`, `gemma:2b`
- Verifiez les ressources CPU/RAM disponibles
- Fermez les autres applications gourmandes

### Erreur "Aucun contenu a traiter"

- Selectionnez du texte avant de cliquer sur l'action
- Pour les champs de saisie, assurez-vous qu'ils contiennent du texte

---

## FAQ

**Q: Mes donnees sont-elles envoyees sur Internet?**
R: Non, tout reste local. Ollama fonctionne entierement sur votre machine.

**Q: Quels modeles sont recommandes?**
R: Pour le francais, `mistral` ou `llama3.2` fonctionnent tres bien. Pour des reponses rapides, `phi3` ou `gemma:2b`.

**Q: Puis-je utiliser un serveur Ollama distant?**
R: Oui, modifiez l'URL dans les options (ex: `http://192.168.1.100:11434`).

**Q: Comment creer un preset personnalise?**
R: Options > Presets > Creer un preset. Ajoutez des actions avec leurs prompts.

**Q: L'extension fonctionne-t-elle sur Firefox?**
R: Non, actuellement Chrome uniquement (Manifest V3).

---

## Support

- [Signaler un bug](https://github.com/Gohanado/ia-helper/issues/new?labels=bug)
- [Demander une fonctionnalite](https://github.com/Gohanado/ia-helper/issues/new?labels=enhancement)
- [Discussions](https://github.com/Gohanado/ia-helper/discussions)

---

**Version:** 1.0.0
**Derniere mise a jour:** 2024-11-26

