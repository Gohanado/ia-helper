# Changelog

Toutes les modifications notables de ce projet seront documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet respecte le [Versionnage Semantique](https://semver.org/lang/fr/).

## [Non publie]

### A venir
- Systeme de logging et debug avance
- Historique des actions
- Mode sombre/clair automatique

---

## [1.3.0] - 2025-11-27

### Ajoute
- **Modification des prompts**: Chaque action peut maintenant etre personnalisee avec un prompt sur mesure
- **Bouton d'edition**: Icone crayon sur chaque action pour modifier son prompt
- **Indicateur visuel**: Les actions avec un prompt modifie affichent un asterisque (*)
- **Restauration**: Bouton pour restaurer le prompt par defaut

### Ameliore
- Le menu contextuel et les raccourcis utilisent les prompts personnalises

---

## [1.2.2] - 2025-11-27

### Corrige
- **Bouton supprimer raccourci**: Position corrigee (etait en haut a droite de l'ecran, maintenant dans le bon conteneur)
- **Prompts unifies**: Les raccourcis clavier utilisent maintenant les memes prompts que le menu contextuel
- **Synchronisation prompts**: Si vous modifiez le prompt d'une action personnalisee, le raccourci associe utilise aussi le nouveau prompt

---

## [1.2.1] - 2025-11-27

### Corrige
- **Version dynamique**: La version est maintenant lue depuis le manifest.json (plus de valeur hardcodee)
- **Prompt rapide**: Ajout d'un fallback window.open si le message au background echoue
- **Raccourcis clavier**: Tous les prompts manquants ajoutes (bullet_points, make_shorter, make_formal, make_casual, explain_code, review_code, debug_help)
- **Actions personnalisees**: Section deplacee en haut de la page des options

---

## [1.2.0] - 2025-11-27

### Corrige
- **Modal action personnalisee**: Utilise maintenant des classes CSS au lieu d'IDs pour eviter les conflits
- **Prompt rapide (Alt+I)**: Correction de l'envoi qui ne fonctionnait pas avec du texte selectionne
- **Actions des categories**: Les actions Essentiels, Pratiques, Techniques et Analyse fonctionnent maintenant correctement
- **CSS popup rapide**: Le champ de saisie ne depasse plus a droite (box-sizing corrige)
- **Duplication de fonctions**: Suppression de 133 lignes de code duplique dans options.js
- **Menu contextuel**: Ajout d'un mutex pour eviter les doublons d'IDs

### Modifie
- **Tous les prompts revus**: Plus de tableaux markdown generes
  - Prompts simplifies pour des reponses fluides et naturelles
  - Ajout explicite de "Pas de tableaux" dans chaque prompt
  - Resumer, Expliquer, Developper produisent du texte fluide
- **Quick prompts**: Resumer page et Extraire points sans formatage excessif

---

## [1.1.0] - 2025-11-27

### Ajoute
- **Support multi-providers IA**
  - Ollama (local, par defaut)
  - OpenAI (GPT-4o, GPT-4-turbo, GPT-3.5-turbo)
  - Anthropic (Claude Sonnet 4, Claude 3.5 Sonnet, Claude 3 Haiku)
  - Groq (Llama 3.3 70B, Mixtral)
  - OpenRouter (acces multi-modeles)
  - Provider personnalise (compatible OpenAI API)

- **Actions personnalisees**
  - Creation d'actions avec prompts personnalises
  - Integration au menu contextuel
  - Gestion (ajout/suppression) depuis les options

- **Raccourcis clavier dynamiques**
  - Attribution de raccourcis a n'importe quelle action
  - Support des actions personnalisees
  - Support des traductions rapides
  - Enregistrement visuel des combinaisons

- **Traductions etendues**
  - 12 langues disponibles (FR, EN, ES, DE, IT, PT, ZH, JA, KO, AR, RU, NL)
  - Activation/desactivation individuelle
  - Integration au menu contextuel

- **Systeme de mise a jour**
  - Verification automatique des nouvelles versions
  - Notification dans les options
  - Lien direct vers le changelog

### Modifie
- Interface des options reorganisee
- Gestion des providers avec URL et cle API dynamiques
- Streaming adapte a chaque provider (Ollama, OpenAI, Anthropic)

### Corrige
- Injections multiples du content-script dans les iframes
- Actions du popup qui ne fonctionnaient pas

---

## [1.0.0] - 2025-11-26

### Ajoute
- **Menu contextuel intelligent**
  - Detection automatique du contexte (selection, champ editable, page)
  - Actions adaptees selon le contexte
  - Injection programmatique du content script pour fiabilite

- **Traduction multi-langues**
  - 11 langues supportees: FR, EN, ES, IT, PT, DE, NL, RU, ZH, JA, AR
  - Traduction depuis le menu contextuel ou les champs de saisie
  - Detection automatique de la langue source

- **24 Presets professionnels (140+ actions)**
  - Support IT, Service Client, Commercial, Developpeur
  - Redacteur, Etudiant, Chercheur, RH/Recruteur
  - Manager, Juriste, Marketing, Product Manager
  - Designer UX, Data Analyst, Community Manager
  - Formateur, Traducteur, Journaliste, Freelance
  - Sante, E-commerce, Copywriter, Createur Contenu
  - Assistant Personnel

- **Rendu Markdown complet**
  - Titres, gras, italique, code
  - Listes a puces et numerotees
  - Blocs de code avec coloration
  - Citations, liens, tableaux

- **Presets personnalises**
  - Creation de presets avec actions personnalisees
  - Modification des prompts
  - Activation/desactivation individuelle
  - Bouton "Personnaliser" pour adapter les presets integres

- **Interface utilisateur**
  - Interface multilingue (FR, EN, ES, IT, PT)
  - Page d'options complete avec onglets
  - Page de resultats avec streaming
  - Indicateur visuel de chargement IA
  - Modal de personnalisation avec scroll

- **Integration Ollama**
  - Connexion au serveur Ollama local
  - Detection automatique des modeles disponibles
  - Streaming des reponses en temps reel
  - Configuration de l'URL du serveur

- **Autres fonctionnalites**
  - Bouton "Signaler un bug" avec template prerempli
  - Bouton "Demander une feature" avec template
  - Sauvegarde des preferences utilisateur
  - Actions rapides (Resumer page, Extraire points essentiels)

### Technique
- Chrome Extension Manifest V3
- Service Worker pour la gestion en arriere-plan
- Content Script pour l'interaction avec les pages
- Storage API pour la persistance des donnees
- Scripting API pour l'injection dynamique

---

## Guide de versionnage

### Format des versions: MAJEUR.MINEUR.PATCH

- **MAJEUR**: Changements incompatibles avec les versions precedentes
- **MINEUR**: Nouvelles fonctionnalites retrocompatibles
- **PATCH**: Corrections de bugs retrocompatibles

### Types de changements

- `Ajoute` pour les nouvelles fonctionnalites
- `Modifie` pour les changements de fonctionnalites existantes
- `Deprecie` pour les fonctionnalites qui seront supprimees
- `Supprime` pour les fonctionnalites supprimees
- `Corrige` pour les corrections de bugs
- `Securite` pour les vulnerabilites corrigees

---

[Non publie]: https://github.com/Gohanado/ia-helper/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.3.0
[1.2.2]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.2
[1.2.1]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.1
[1.2.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.0
[1.1.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.1.0
[1.0.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.0.0

