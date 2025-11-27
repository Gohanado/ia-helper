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

## [1.5.0] - 2025-11-27

### Ajoute
- **Reponse directe dans le champ de saisie**: Nouvelle option pour que l'IA reponde directement dans le champ actif
- **Mode d'insertion**: Choisir entre "Remplacer le contenu" ou "Ajouter a la suite"
- **Streaming dans le champ**: La reponse s'ecrit en temps reel dans le champ de saisie

### Corrige
- **Quick prompt popup**: Le prompt rapide depuis le popup affiche maintenant correctement le popup de generation
- **actionId pour custom_prompt**: Definition automatique de l'actionId pour les prompts personnalises

### Ameliore
- **Traductions completes**: Nouvelles cles pour les options de reponse directe (5 langues)

---

## [1.4.9] - 2025-11-27

### Corrige
- **Quick prompt fonctionne**: Le champ de prompt rapide dans le popup envoie maintenant correctement les requetes
- **Bouton Raccourcis**: Ouvre maintenant l'onglet Raccourcis dans les options (pas chrome://extensions)
- **Scroll popup reduit**: Espacement reduit pour eviter le scroll inutile
- **Bouton "..." langues**: Style ameliore pour le bouton de langues supplementaires

### Ameliore
- **Support custom_prompt**: Le content-script gere maintenant le type custom_prompt pour les prompts libres
- **Navigation hash URL**: Les options supportent le hash pour ouvrir directement un onglet (ex: options.html#shortcuts)

---

## [1.4.8] - 2025-11-27

### Ajoute
- **Popup completement redesigne**: Nouveau design professionnel avec prompt rapide, actions rapides, traduction, et infos du modele
- **Menu contextuel traduit**: Tous les titres du menu clic droit sont maintenant traduits (5 langues)
- **Messages mise a jour traduits**: Les notifications de mise a jour utilisent le systeme i18n

### Ameliore
- **Nouvelles traductions popup**: 15+ nouvelles cles pour le popup (connecting, ready, offline, askAnything, etc.)
- **Support multi-provider dans popup**: Affichage du provider et modele actif
- **Verification connexion amelioree**: Test adapte selon le provider (Ollama, OpenAI, Groq, etc.)

### Modifie
- **Popup simplifie**: Plus de tabs, interface directe avec toutes les fonctionnalites visibles
- **Design moderne**: Icones SVG, pills de langues, barre d'info modele

---

## [1.4.7] - 2025-11-27

### Ameliore
- **Results.html traduit**: La page results.html utilise maintenant le systeme i18n complet
- **Toggle Reduire/Agrandir traduit**: Les boutons changent de texte dans la bonne langue
- **Notifications traduites dans results.js**: Copie, erreurs, statuts utilisent t()

### Supprime
- **Boutons inutiles retires**: Les boutons "Fermer" et "Appliquer" ont ete supprimes de results.html

---

## [1.4.6] - 2025-11-27

### Ameliore
- **Traductions 100% completes**: Toutes les cles de traduction sont maintenant disponibles pour les 5 langues (FR, EN, ES, IT, PT)
- **Popup inline traduit**: Le popup de reponse utilise maintenant le systeme i18n (Copier, Voir en detail, Fermer, etc.)
- **Notifications traduites**: Toutes les notifications dans options.js utilisent maintenant t() au lieu de textes en dur
- **Nouvelles cles ajoutees**: reduce, expand, waiting, responseWillAppear, apply, copyOptions, updates, checking, checkNow, changelog, changelogDesc, viewChangelog, documentationDesc, readDoc, reportProblem, credits, developer, contact, license, freePersonalUse, resetSection, resetWarning, updateAvailable, download, youHaveLatest, unableToCheckUpdates, newAction, name, context, textSelection, inputField, fullPage, all, promptPlaceholder, actionNamePlaceholder, presetNameExample, shortDescription, allActionsEnabled, allActionsDisabled, defaultActionsRestored, shortcutAdded, shortcutsSaved, fillAllFields, actionCustomCreated, allActionsHaveShortcuts

---

## [1.4.5] - 2025-11-27

### Ameliore
- **Interface HTML traduite**: Tous les textes en dur dans options.html utilisent maintenant le systeme i18n
- **Nouvelles cles ajoutees**: iaProvider, apiKey, apiKeyHint, inlinePopup, contextMenuActions, essentials, practical, technical, analysis, translation, enableAll, disableAll, keyboardShortcuts, connectingToAI, viewDetails, etc.

---

## [1.4.4] - 2025-11-27

### Ajoute
- **Vrai streaming dans le popup**: La reponse s'affiche maintenant caractere par caractere en temps reel grace a chrome.runtime.connect
- **Bouton Options**: Engrenage dans results.html pour acceder directement aux options de l'extension

### Ameliore
- **Scroll automatique**: Le popup scroll automatiquement vers le bas pendant le streaming

---

## [1.4.3] - 2025-11-27

### Ajoute
- **Menu copie avance**: Copier en Markdown, Texte brut ou HTML depuis le popup
- **Voir en detail sans regenerer**: Cliquer sur "Voir en detail" affiche directement le resultat deja genere au lieu de relancer l'IA

### Retire
- **Bouton "Nouvel onglet"**: Retire de la page results.html (inutile)

---

## [1.4.2] - 2025-11-27

### Ajoute
- **Popup inline pour le menu contextuel**: Toutes les actions du menu clic-droit affichent maintenant la reponse dans un popup flottant au lieu d'ouvrir un nouvel onglet
- **Boutons Copier/Voir en detail**: Disponibles pour chaque action
- **Option desactivable**: Si desactive dans les options, les actions ouvrent un nouvel onglet comme avant

### Corrige
- **Erreur currentConfig**: Correction de la reference a la variable config dans le service-worker

---

## [1.4.1] - 2025-11-27

### Corrige
- **Popup inline**: La generation IA passe maintenant par le background script pour eviter les erreurs CORS "Failed to fetch"
- **Rechargement config**: La configuration est rechargee avant chaque appel pour prendre en compte les changements d'option
- **Message d'attente**: Affichage "Connexion a l'IA en cours..." pendant l'attente de la reponse

---

## [1.4.0] - 2025-11-27

### Ajoute
- **Popup inline avec streaming**: Le prompt rapide affiche maintenant la reponse directement dans un popup flottant avec streaming en temps reel
- **Bouton "Voir en detail"**: Permet d'ouvrir la reponse dans un nouvel onglet pour plus de confort
- **Bouton "Copier"**: Copie la reponse dans le presse-papier en un clic
- **Option desactivable**: Possibilite de desactiver le popup inline dans les options pour revenir au comportement classique (ouverture dans un nouvel onglet)

### Ameliore
- **Experience utilisateur**: Plus besoin de changer d'onglet pour voir les reponses courtes

---

## [1.3.2] - 2025-11-27

### Corrige
- **Bug critique prompts**: Les prompts par defaut sont maintenant affiches correctement lors de la modification d'une action
- **CSS champ API key**: Le champ de saisie de la cle API a maintenant le meme style que les autres champs
- **Detection conflits raccourcis**: Verification automatique des conflits avec les raccourcis systeme (Ctrl+C, Ctrl+V, etc.) et les raccourcis existants
- **Message de confirmation**: Notification de succes lors de l'enregistrement d'un raccourci

### Supprime
- **Liens de don**: Suppression des liens PayPal de la sidebar et de la page A propos

---

## [1.3.1] - 2025-11-27

### Corrige
- **CSS boutons actions**: Les boutons editer/supprimer ne se superposent plus pour les actions personnalisees
- **Traductions completes**: Ajout de toutes les cles manquantes (shortcuts, custom actions) pour les 5 langues (FR, EN, ES, IT, PT)

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

[Non publie]: https://github.com/Gohanado/ia-helper/compare/v1.4.5...HEAD
[1.4.5]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.5
[1.4.4]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.4
[1.4.3]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.3
[1.4.2]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.2
[1.4.1]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.1
[1.4.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.0
[1.3.2]: https://github.com/Gohanado/ia-helper/releases/tag/v1.3.2
[1.3.1]: https://github.com/Gohanado/ia-helper/releases/tag/v1.3.1
[1.3.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.3.0
[1.2.2]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.2
[1.2.1]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.1
[1.2.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.2.0
[1.1.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.1.0
[1.0.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.0.0

