# Publication Chrome Web Store

## Informations requises

### Nom de l'extension
```
IA Helper - Assistant IA Local
```

### Description courte (132 caracteres max)
```
Assistant IA 100% local avec Ollama. Correction, traduction, reformulation. Vos donnees restent sur votre machine.
```

### Description longue
```
IA Helper - Votre assistant IA local et prive

Connectez votre navigateur Chrome a Ollama pour beneficier de l'intelligence artificielle directement dans vos pages web, sans envoyer vos donnees sur Internet.

FONCTIONNALITES PRINCIPALES
- Correction orthographique et grammaticale instantanee
- Traduction en 12 langues (FR, EN, ES, IT, PT, DE, NL, RU, ZH, JA, AR, KO)
- Reformulation professionnelle d'emails
- Resume de texte et de pages web
- Streaming en temps reel des reponses
- Rendu Markdown complet

24 PRESETS PROFESSIONNELS (140+ actions)
- Etudiant : Redaction, recherche, revision
- Assistant Personnel : Emails, organisation, rappels
- Ecrivain : Creativite, style, relecture
- Developpeur : Code review, documentation, debugging
- Support IT : Tickets, diagnostics, solutions
- Service Client : Reponses, satisfaction, escalade
- Commercial : Propositions, relances, negociation
- Designer UX : Personas, wireframes, tests
- Data Analyst : Rapports, visualisation, insights
- RH/Recruteur : Offres, entretiens, onboarding
- Manager : Reunions, delegations, feedback
- Juriste : Contrats, conformite, veille
- Marketing : Campagnes, SEO, branding
- Product Manager : Roadmap, specs, KPIs
- Copywriter : Headlines, landing pages, CTAs
- Et bien plus...

CONFIDENTIALITE TOTALE
- 100% local : vos donnees restent sur votre machine
- Aucun serveur externe, aucun tracking
- Fonctionne avec Ollama (gratuit et open source)
- Zero collecte de donnees personnelles

PRE-REQUIS
- Ollama installe sur votre machine (ollama.ai)
- Un modele telecharge (llama3.2, mistral, phi3...)

OPEN SOURCE
Le code source est disponible sur GitHub. Contributions bienvenues!
```

### Categorie
```
Productivite
```

### Langues
- Francais (principal)
- Anglais
- Espagnol
- Italien
- Portugais

---

## Assets requis

### Icones (deja pretes)
- [x] icon16.png (16x16)
- [x] icon32.png (32x32)
- [x] icon48.png (48x48)
- [x] icon128.png (128x128)

### A creer
- [ ] Capture d'ecran 1: Menu contextuel (1280x800)
- [ ] Capture d'ecran 2: Page de resultats (1280x800)
- [ ] Capture d'ecran 3: Page d'options (1280x800)
- [ ] Capture d'ecran 4: Popup (1280x800)
- [ ] Icone promotionnelle (440x280)

---

## Checklist publication

- [x] manifest.json valide
- [x] Permissions justifiees
- [x] Politique de confidentialite (PRIVACY.md)
- [x] Licence claire
- [x] Documentation complete
- [x] Code propre et commente
- [ ] Screenshots prepares
- [ ] Icone promo preparee
- [ ] Compte developpeur Chrome ($5 one-time)
- [ ] ZIP de publication genere

---

## Commande pour generer le ZIP

```powershell
Remove-Item ia-helper-v1.0.0.zip -ErrorAction SilentlyContinue
Compress-Archive -Path "manifest.json", "src", "assets" -DestinationPath "ia-helper-v1.0.0.zip" -Force
```

---

## Liens utiles

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [Guide de publication](https://developer.chrome.com/docs/webstore/publish/)
- [Politiques du store](https://developer.chrome.com/docs/webstore/program_policies/)


