# Changelog

Toutes les modifications notables de ce projet seront documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet respecte le [Versionnage Semantique](https://semver.org/lang/fr/).

## [Non publie]

### A venir
- Systeme de logging et debug avance
- Creation automatique d'issues GitHub en cas d'erreur
- Mode sombre/clair automatique
- Raccourcis clavier personnalisables
- Historique des actions

---

## [1.0.0] - 2024-11-26

### Ajoute
- **Menu contextuel intelligent**
  - Detection automatique du contexte (selection, champ editable, page)
  - Actions adaptees selon le contexte
  - Injection programmatique du content script pour fiabilite

- **Traduction multi-langues**
  - 11 langues supportees: FR, EN, ES, IT, PT, DE, NL, RU, ZH, JA, AR
  - Traduction depuis le menu contextuel ou les champs de saisie
  - Detection automatique de la langue source

- **Presets professionnels**
  - Support IT: diagnostic, solutions, tickets
  - Service Client: reponses empathiques, reclamations
  - Commercial: emails persuasifs, propositions
  - Developpeur: review code, documentation, debug
  - Redacteur: style, ton, structure
  - Etudiant: fiches revision, explications
  - Chercheur: analyse articles, synthese

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

[Non publie]: https://github.com/Gohanado/ia-helper/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Gohanado/ia-helper/releases/tag/v1.0.0

