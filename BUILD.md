# Guide de Build - IA Helper

Ce document explique comment construire les packages pour Chrome et Firefox.

## Structure du projet

Le projet maintient deux versions distinctes:
- **Chrome**: Version standard avec modules ES6
- **Firefox**: Version adaptee avec configuration specifique

## Processus de build

### Build automatique

Pour creer les packages pour Chrome et Firefox:

```bash
npm run package
```

Cette commande:
1. Nettoie le dossier `dist/`
2. Cree `dist/chrome/` avec les fichiers sources
3. Cree `dist/firefox/` avec les adaptations Firefox
4. Genere les archives ZIP dans `dist/`

### Resultats

Apres le build, vous trouverez:
- `dist/chrome/` - Dossier source pour Chrome
- `dist/firefox/` - Dossier source pour Firefox (avec adaptations)
- `dist/ia-helper-chrome-v{version}.zip` - Package Chrome
- `dist/ia-helper-firefox-v{version}.zip` - Package Firefox

## Differences Chrome vs Firefox

### Manifest

**Chrome** (`manifest.json`):
```json
{
  "background": {
    "service_worker": "src/background/service-worker.js"
  }
}
```

**Firefox** (genere automatiquement):
```json
{
  "background": {
    "scripts": ["src/background/service-worker.js"]
  },
  "browser_specific_settings": {
    "gecko": {
      "id": "ia-helper@badom.ch",
      "strict_min_version": "109.0",
      "data_collection_permissions": {
        "required": false
      }
    }
  }
}
```

### Bundling JavaScript

Firefox ne peut pas valider correctement les modules ES6. Le build Firefox:
1. Bundle les fichiers JavaScript en concatenant les dependances
2. Retire les declarations `import` et `export`
3. Retire `type="module"` des balises `<script>` dans les HTML

Fichiers bundles:
- `src/chat/chat.js` (avec translations.js, agents.js, dom-sanitizer.js)
- `src/options/options.js` (avec translations.js, agents.js, dom-sanitizer.js)
- `src/results/results.js` (avec translations.js, dom-sanitizer.js)

Le code fonctionne de maniere identique, mais sans la syntaxe des modules ES6.

## Mise a jour de version

Avant de creer un nouveau package:

1. Mettre a jour la version dans:
   - `manifest.json`
   - `package.json`
   - `version.json`

2. Mettre a jour `CHANGELOG.md`

3. Lancer le build:
   ```bash
   npm run package
   ```

## Upload sur les stores

### Chrome Web Store
1. Utiliser `dist/ia-helper-chrome-v{version}.zip`
2. Uploader sur https://chrome.google.com/webstore/devconsole

### Firefox Add-ons
1. Utiliser `dist/ia-helper-firefox-v{version}.zip`
2. Uploader sur https://addons.mozilla.org/developers/

## Notes importantes

- Ne jamais modifier directement les fichiers dans `dist/`
- Toujours modifier les sources dans `src/` et relancer le build
- Le dossier `dist/` est ignore par git
- Les deux versions partagent le meme code source
- Seules les configurations (manifest) et les ressources accessibles different

