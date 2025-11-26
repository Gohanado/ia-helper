# Guide de Contribution - IA Helper

Merci de votre interet pour contribuer a IA Helper!

## Comment Contribuer

### 1. Signaler un Bug

1. Verifiez que le bug n'a pas deja ete signale dans les [Issues](https://github.com/Gohanado/ia-helper/issues)
2. Creez une nouvelle issue avec le template "Bug Report"
3. Incluez:
   - Description claire du probleme
   - Etapes pour reproduire
   - Comportement attendu vs observe
   - Version de Chrome et de l'extension
   - Modele Ollama utilise

### 2. Proposer une Fonctionnalite

1. Ouvrez une issue avec le template "Feature Request"
2. Decrivez:
   - Le besoin ou probleme a resoudre
   - La solution proposee
   - Les cas d'utilisation
   - Les alternatives considerees

### 3. Soumettre du Code (Pull Request)

#### Avant de coder:
- Ouvrez d'abord une issue pour discuter du changement
- Attendez la validation de l'equipe avant de commencer

#### Processus:
1. Forkez le repository
2. Creez une branche depuis `main`:
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. Faites vos modifications
4. Testez votre code
5. Committez avec un message clair:
   ```bash
   git commit -m "feat: description de la fonctionnalite"
   ```
6. Pushez vers votre fork
7. Ouvrez une Pull Request

#### Convention de commits:
- `feat:` Nouvelle fonctionnalite
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage (pas de changement de code)
- `refactor:` Refactorisation
- `test:` Ajout de tests
- `chore:` Maintenance

### 4. Ajouter des Traductions

Les traductions sont dans `src/i18n/translations.js`. Pour ajouter une langue:
1. Copiez une langue existante
2. Traduisez toutes les chaines
3. Testez l'interface dans cette langue

### 5. Ajouter des Presets

Les presets sont dans `src/config/presets.js`. Format:
```javascript
mon_preset: {
  id: 'mon_preset',
  name: 'Nom du Preset',
  description: 'Description courte',
  icon: 'icone',
  actions: [
    { id: 'action1', name: 'Nom Action', prompt: 'Prompt IA...' }
  ]
}
```

## Regles

1. **Code propre** - Pas de code commente, noms de variables clairs
2. **Pas de dependances externes** - L'extension doit rester legere
3. **Compatibilite** - Chrome 88+ requis
4. **Francais** - Les commentaires peuvent etre en francais ou anglais
5. **Tests** - Testez vos modifications avant de soumettre

## Ce que nous n'acceptons pas

- Code copie sans attribution
- Fonctionnalites qui envoient des donnees a des serveurs externes
- Publicites ou tracking
- Code malveillant

## Propriete Intellectuelle

En soumettant une contribution, vous acceptez que:
- Votre code soit integre sous la licence IA Helper
- Vous soyez credite dans CONTRIBUTORS.md
- L'equipe puisse modifier votre contribution si necessaire

## Questions?

- Ouvrez une issue avec le tag `question`
- Email: contact@badom.ch

---

Merci de contribuer a IA Helper!

