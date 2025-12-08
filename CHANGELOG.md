# Changelog

Toutes les modifications notables de ce projet seront documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet respecte le [Versionnage Semantique](https://semver.org/lang/fr/).

## [Non publie]

### A venir
- Systeme de logging et debug avance
- Mode sombre/clair automatique
- System instructions personnalisees

---

## [2.0.1] - 2025-12-09

### Statut
- **VERSION STABLE CHROME**: OK
- **VERSION STABLE FIREFOX**: OK (popup streaming long texte fixe)

### Ajoute
- Bouton dictée vocale (STT) sur toutes les zones de saisie (popup rapide, chat live, page results).

### Corrige
- Popup Firefox: streaming longue reponse ne se coupe plus (keepalive + fallback non-streaming).
- Bouton Stop: libelle corrige et traduit proprement.
- Manifest Firefox: ajout de `data_collection_permissions` pour AMO (suppression du warning).

### Technique
- `maxTokens` streaming releve a 8000.
- Keepalive cote client popup + fallback automatique si le port tombe.

---

## [2.0.0] - 2025-12-08

### Statut
- **VERSION STABLE CHROME**: OK
- **VERSION FIREFOX**: Popup inline encore a investiguer (generation longue qui s'arrete trop tot)

### Ajoute / Ameliore
- **Internationalisation complete**: noms/descriptions des agents, actions de base, suggestions du chat, labels menu contextuel.
- **Menu contextuel**: libelles traduire pour `pageActions` et `createCustomAction`, ouverture directe de la creation d'action (onglet Presets).
- **Experience chat**: suggestions multilingues, badge agent localise, enforcement langue de reponse des agents.
- **Documentation**: README refait (multi-providers, Ollama local, packaging), docs Chrome Store et docs/README mis a jour.
- **Packaging**: nettoyage des artefacts ZIP suivis par git, version unifiee 2.0.0 (manifest Chrome/Firefox, package.json, version.json).

### Technique
- Scripts d'empaquetage conserves (`npm run package`, scripts/build-*.js/ps1) ; ZIP ignores par git.
- Known issue: sur Firefox, popup inline peut stopper des generations longues (a corriger).

---

## [1.9.2] - 2025-12-07

### Statut
- **VERSION STABLE CHROME**: 100% fonctionnelle - Toutes les fonctionnalites testees et validees
- **VERSION FIREFOX**: A corriger - Bugs identifies (menu contextuel incomplet, popup sans reponse, results ne charge pas)

### Ajoute
- **Actions de page enrichies**: 4 nouvelles actions dans la section Page du popup
  - Traduire la page: Traduction complete de la page web
  - Analyser le sentiment: Analyse du ton et sentiment du contenu
  - Extraire les liens: Extraction et organisation de tous les liens
  - Generer un plan: Creation d'un plan structure du contenu
- **Bouton stop generation**: Controle de la generation LLM
  - Bouton "Arreter" dans le popup de reponse inline
  - Bouton stop dans la page results
  - Arret automatique de la generation lors de la fermeture du popup
  - Economie de ressources (plus de generations inutiles en arriere-plan)
- **Menu contextuel ameliore**: Organisation et traductions
  - Traduction complete de "Create custom action" dans toutes les langues
  - Navigation directe vers l'onglet Presets lors de la creation d'action personnalisee
  - Structure du menu contextuel optimisee

### Ameliore
- **Detection de langue ultra-rapide**: Optimisation de la lecture audio
  - Remplacement de la detection IA (10-15 secondes) par detection client (< 1ms)
  - Analyse de mots courants pour 5 langues (FR, EN, ES, IT, PT)
  - Demarrage instantane de la lecture vocale
  - Pas de requete reseau pour la detection
- **Selection de voix TTS**: Correction du chargement des voix
  - Voix configuree utilisee des la premiere lecture (popup, results, live chat)
  - Mecanisme d'attente des voix avec event listener voiceschanged
  - Timeout de securite pour garantir le chargement
- **Prompt rapide**: Correction du comportement
  - Affichage uniquement du popup de reponse (suppression de l'ouverture du chat)
  - Tooltip corrige: "Envoyer" au lieu de "Envoyer au chat"
  - Comportement coherent avec les attentes utilisateur
- **Gestion des ports de streaming**: Architecture optimisee
  - Variable currentStreamingPort pour tracker les connexions actives
  - Deconnexion propre lors de la fermeture du popup
  - Prevention des fuites de ressources

### Corrige
- **Popup de reponse**: Correction de l'affichage
  - Suppression de l'ouverture simultanee du chat et du popup
  - Le popup inline s'affiche correctement sans ouvrir le chat
- **Taille du popup**: Hauteur fixe optimisee
  - Hauteur fixe de 600px avec scroll interne
  - Plus de redimensionnement lors de l'ouverture/fermeture des sections
  - Experience utilisateur amelioree

### Technique
- **Traductions ajoutees**: Nouvelles cles i18n
  - stopGeneration: "Arreter" (FR), "Stop" (EN)
  - generationStopped: "Generation arretee" (FR), "Generation stopped" (EN)
  - translatePage, analyzeSentiment, extractLinks, generateOutline
  - pageActions: "Actions de page"
- **Fichiers modifies**:
  - src/chat/chat.js: Correction chargement voix TTS
  - src/content/content-script.js: Bouton stop, detection langue rapide, voix TTS
  - src/results/results.js: Bouton stop, detection langue rapide, voix TTS
  - src/results/results.html: Bouton stop dans header
  - src/results/results.css: Style bouton stop
  - src/popup/popup.js: Correction prompt rapide, nouvelles actions page
  - src/popup/popup.html: Correction tooltip
  - src/options/options.js: Navigation vers Presets
  - src/i18n/translations.js: Nouvelles traductions

---

## [1.9.1] - 2025-12-06

### Statut
- **VERSION STABLE FIREFOX**: Validation 100% reussie (0 erreurs, 0 warnings)
- **VERSION STABLE CHROME**: Testee et fonctionnelle

### Corrige
- **Validation Firefox Add-ons**: Elimination complete de tous les warnings
  - Remplacement innerHTML par DOMParser dans dom-sanitizer.js et content-script.js
  - Configuration data_collection_permissions avec required: ["none"]
  - Version minimale Firefox: strict_min_version 142.0
  - Format ZIP compatible avec slashes Unix
- **Correction erreurs de syntaxe**: Correction de toutes les erreurs de syntaxe JavaScript
  - Correction des parentheses manquantes dans setTrustedHTML() (options.js, chat.js, content-script.js)
  - Correction de la configuration dans results.js (ollamaUrl -> apiUrl)
- **Optimisation du streaming dans results.js**: Elimination du scintillement pendant la generation
  - Suppression de l'animation CSS fadeIn qui causait le scintillement
  - Implementation du streaming via Port Chrome comme dans chat.js
  - Parsing markdown en temps reel sans scintillement
  - Amelioration de la performance de rendu

---

## [1.9.0] - 2025-12-06

### Ajoute
- **Systeme d'agents personnalises**: Gestion complete d'agents IA configurables
  - Interface de gestion dans les options avec grille d'agents
  - 6 agents integres par defaut (Assistant General, Developpeur, Redacteur, Traducteur, Analyste, Enseignant, Creatif)
  - Creation d'agents personnalises avec tous les parametres
  - Configuration complete: nom, description, icone, system prompt
  - Parametres avances: temperature, max tokens, top_p, frequency penalty, presence penalty
  - Selection du modele par agent
  - Actions: creer, modifier, dupliquer, supprimer
  - Selecteur d'agent dans le header du chat
  - Dropdown avec sections agents integres et personnalises
  - Badge affichant l'agent actuel avec icone
  - Sauvegarde de l'agent utilise dans chaque conversation
  - Application automatique des parametres de l'agent aux requetes API
  - Support de tous les providers (Ollama, OpenAI, Anthropic, Groq, OpenRouter, Custom)

- **Build multi-navigateurs**: Systeme de build separe pour Chrome et Firefox
  - Script de build automatique (`npm run package`)
  - Dossiers de build distincts: `dist/chrome/` et `dist/firefox/`
  - Bundling automatique des modules ES6 pour Firefox
  - Configuration manifest adaptee pour chaque navigateur
  - Documentation complete dans BUILD.md

### Corrige
- **Code blocks**: Correction du debordement horizontal
  - Ajout de scroll horizontal pour le code long
  - Limitation de la largeur max a 100%
  - Prevention du debordement du conteneur parent
- **Blockquotes**: Reduction de l'espacement vertical
  - Marge reduite de 12px a 6px pour un affichage plus compact
- **Firefox**: Compatibilite complete avec Firefox
  - Ajout de `data_collection_permissions` dans le manifest
  - Bundling des fichiers JavaScript pour eviter les erreurs de validation
  - Retrait de `type="module"` des fichiers HTML
  - Configuration `browser_specific_settings` correcte

---

## [1.8.4] - 2025-12-06

### Corrige
- **Parser Markdown ameliore**: Correction du rendu des tableaux et du contenu formate
  - Fix des placeholders utilisant § au lieu de _ pour eviter conflits avec italic
  - Parser le contenu des cellules de tableau (inline code, bold, italic, links)
  - Restauration correcte des blocs proteges (code blocks et tableaux)
  - Boutons "Copier" correctement affiches dans les tableaux
  - Suppression des espaces/indentation dans les templates HTML pour eviter problemes d'affichage

---

## [1.8.3] - 2025-12-06

### Ajoute
- **Code blocks ameliores**: Affichage professionnel avec bouton copie
  - Header avec nom du langage
  - Bouton copie pour chaque code block
  - Feedback visuel lors de la copie
  - Styles dedies avec fond colore et bordures
  - Nettoyage automatique du code (trim)
- **Selecteur de modele dans header**: Changement rapide de modele IA
  - Dropdown avec liste des modeles disponibles
  - Badge cliquable affichant le modele actuel
  - Mise a jour instantanee de la config
  - Support tous les providers (Ollama, OpenAI, Anthropic, Groq, OpenRouter, Custom)
  - Modeles par defaut pour chaque provider
  - Message si aucun modele disponible
- **Selection multiple conversations**: Gestion en masse
  - Bouton "Selectionner" pour activer le mode selection
  - Checkboxes sur chaque conversation
  - Bouton "Supprimer (X)" affichant le nombre de selections
  - Confirmation avant suppression
  - Traductions dans les 5 langues

### Ameliore
- **Header chat**: Texte decale pour eviter le hamburger en mode collapse
  - Margin-left de 48px quand sidebar collapsed
  - Animation fluide
- **Code blocks**: Header ultra-compact et elegant
  - Padding reduit: 3px 8px
  - Hauteur minimale: 24px
  - Taille police: 9px
  - Bouton copie: 18px hauteur
  - Meilleure lisibilite
  - Traitement en priorite pour eviter conflits avec autres regex
- **Inline code**: Bouton copie discret au survol
  - Apparait seulement au hover
  - Design minimaliste
  - Feedback visuel lors de la copie

### Corrige
- **Bouton tout supprimer**: Variable corrigee (conversations au lieu de conversationsData)
- **Selecteur modele**: Utilisation correcte de config.provider au lieu de config.selectedProvider
- **Modeles Ollama**: Fetch dynamique des modeles depuis l'API Ollama
- **Modeles OpenRouter**: Liste complete des modeles disponibles
- **Markdown rendering COMPLET**: Systeme de placeholders pour eviter conflits
  - Code blocks extraits AVANT escapeHtml()
  - Inline code extrait AVANT escapeHtml()
  - HTML echappe seulement pour le texte normal
  - Placeholders restaures a la fin
  - Tous les elements Markdown rendus correctement
- **Dropdown menus**: Fermeture correcte quand on clique ailleurs
  - Copy dropdown
  - Model dropdown

---

## [1.8.2] - 2025-12-06

### Ajoute
- **Support LaTeX**: Affichage des formules mathematiques
  - Formules inline avec `\( ... \)`
  - Formules block avec `\[ ... \]`
  - Styles dedies avec police serif et fond colore
- **Options de copie multiples**: Menu deroulant pour choisir le format de copie
  - Copier en texte brut (sans formatage)
  - Copier en Markdown (avec formatage original)
  - Menu dropdown elegant avec animation
- **Suppression en masse**: Bouton pour supprimer toutes les conversations
  - Bouton "Tout supprimer" dans le footer du sidebar
  - Confirmation avant suppression
  - Traductions dans les 5 langues

### Ameliore
- **Sidebar collapse**: Toute la page se deplace maintenant a gauche
  - Le chat-main utilise margin-left negatif
  - Animation fluide et coherente
  - Plus de vide a droite du header

### Corrige
- **Header chat**: Se deplace correctement avec toute la page quand sidebar collapse
- **Menu copie**: Fermeture automatique du dropdown quand on clique ailleurs

---

## [1.8.1] - 2025-12-06

### Ajoute
- **Support Markdown complet**: Tous les elements Markdown sont maintenant supportes
  - Headers (h1-h6) avec styles differencies
  - Horizontal rules (---, ***, ___)
  - Blockquotes avec bordure gauche coloree
  - Strikethrough (~~texte~~)
  - Links avec hover effect
  - Images avec bordure arrondie
  - Task lists (- [ ] et - [x])
  - Bold et italic avec ** ou __ et * ou _
  - Code blocks avec support du langage

### Ameliore
- **Sidebar collapse**: Le sidebar disparait maintenant completement
  - Bouton hamburger reste visible en position fixe
  - Animation fluide avec opacity
  - Header s'adapte automatiquement (padding-left)
- **Boutons de controle**: Gestion intelligente de l'affichage
  - Bouton "Arreter generation" masque pendant la lecture vocale seule
  - Bouton "Arreter lecture" visible uniquement pendant la lecture
  - Pas de confusion entre les deux actions
- **TTS Markdown**: Suppression complete des emojis et tableaux
  - Tous les ranges Unicode d'emojis retires
  - Tableaux Markdown completement supprimes du texte lu
  - Lecture encore plus naturelle

### Corrige
- **Bouton stop generation**: N'apparait plus pendant la lecture vocale seule
- **Header chat**: Se deplace correctement a gauche quand sidebar collapse
- **Affichage tableaux**: Les tableaux Markdown s'affichent en HTML propre
- **Emojis TTS**: Les emojis ne sont plus lus par la synthese vocale

---

## [1.8.0] - 2025-12-06

### Ajoute
- **Support du thinking**: Affichage separe de la reflexion de l'IA pour les modeles compatibles (gpt-oss, etc.)
  - Section "Reflexion" distincte avant la reponse
  - Streaming en temps reel du thinking et de la reponse
  - Design visuel different pour distinguer thinking et reponse
- **Boutons de controle**: Nouveaux boutons pour controler la generation et la lecture
  - Bouton "Arreter" pour stopper la generation en cours
  - Bouton "Arreter lecture" pour stopper la synthese vocale
  - Signal d'abort envoye au serveur LLM pour economiser les ressources
- **Nettoyage Markdown pour TTS**: Le texte lu par la synthese vocale ne contient plus de Markdown
  - Suppression des balises de code, headers, bold, italic, liens, etc.
  - Lecture plus naturelle et fluide

### Ameliore
- **Sidebar collapsible**: Le sidebar reste partiellement visible quand reduit (50px)
  - Bouton toggle toujours accessible
  - Pas de sortie complete de l'ecran
- **Auto-scroll intelligent**: L'utilisateur peut scroller manuellement pendant la generation
  - Detection du scroll manuel
  - Auto-scroll desactive si l'utilisateur remonte
  - Reactivation automatique si l'utilisateur scrolle vers le bas
- **Gestion des erreurs**: Meilleure gestion des annulations et erreurs de generation

### Corrige
- **Sidebar**: Le sidebar ne sort plus completement de l'ecran quand reduit
- **TTS**: La lecture vocale ne lit plus le Markdown brut
- **Streaming**: Les reponses s'affichent maintenant progressivement en temps reel
- **Abort**: L'annulation de generation stoppe maintenant aussi le serveur LLM

---

## [1.7.0] - 2025-12-06

### Ajoute
- **Chat IA complet**: Nouvelle interface de chat accessible depuis le popup
  - Conversations libres avec l'IA sans selection de texte
  - Historique des conversations sauvegarde localement
  - Sidebar avec liste des conversations
  - Recherche dans les conversations
  - Export des conversations en fichier texte
  - Suppression des conversations
  - Memoire du contexte pendant la conversation
  - Streaming des reponses en temps reel
  - Suggestions de prompts pour demarrer
  - Support TTS (lecture vocale) des reponses
  - Copie des reponses en un clic
- **Bouton Chat dans le popup**: Acces rapide au chat depuis l'icone de l'extension
- **Traductions Chat**: Interface du chat traduite en 5 langues (FR, EN, ES, IT, PT)

### Ameliore
- **Options TTS**: Selecteur de voix avec liste des voix systeme disponibles
- **Presets de tonalite**: Boutons "Voix grave" et "Voix aigue" pour ajuster le pitch
- **Test de voix multilingue**: Le texte de test s'adapte a la langue de la voix selectionnee

---

## [1.6.0] - 2025-12-05

### Ajoute
- **Lecture vocale (Text-to-Speech)**: Nouveau bouton "Lire" pour ecouter les reponses de l'IA
  - Disponible dans le popup inline, le quick prompt et la page de resultats
  - Support multi-langues (FR, EN, ES, IT, PT)
  - Bouton "Stop" pour arreter la lecture en cours
  - Nettoyage automatique du Markdown pour une lecture fluide

### Corrige
- **Conformite Chrome Web Store**: Permission "tabs" retiree du manifest (non necessaire avec activeTab)

---

## [1.5.0] - 2025-11-27

### Ajoute
- **Reponse directe dans le champ de saisie**: Nouvelle option pour que l'IA reponde directement dans le champ actif
- **Mode d'insertion**: Choisir entre "Remplacer le contenu" ou "Ajouter a la suite"
- **Streaming dans le champ**: La reponse s'ecrit en temps reel dans le champ de saisie
- **Support Firefox**: Extension maintenant disponible pour Firefox (MV3)
- **Script de build**: Nouveau script `build.ps1` pour generer les packages Chrome et Firefox

### Corrige
- **Quick prompt popup**: Le prompt rapide depuis le popup affiche maintenant correctement le popup de generation
- **actionId pour custom_prompt**: Definition automatique de l'actionId pour les prompts personnalises
- **Restauration contenu**: En cas d'erreur, le contenu original du champ est restaure

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

[Non publie]: https://github.com/Gohanado/ia-helper/compare/v1.5.0...HEAD
[2.0.0]: https://github.com/Gohanado/ia-helper/releases/tag/v2.0.0
[1.5.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.5.0
[1.4.9]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.9
[1.4.8]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.8
[1.4.7]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.7
[1.4.6]: https://github.com/Gohanado/ia-helper/releases/tag/v1.4.6
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

