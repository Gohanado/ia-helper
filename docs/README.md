# Documentation IA Helper

Documentation technique et guide utilisateur complet pour l'extension IA Helper.

## Table des matieres

1. [Guide de demarrage rapide](#guide-de-demarrage-rapide)
2. [Installation d'Ollama (detaille)](#installation-dollama-detaille)
3. [Serveur Ollama distant (VPS/VM)](#serveur-ollama-distant)
4. [Configuration avancee](#configuration-avancee)
5. [Fonctionnalites detaillees](#fonctionnalites-detaillees)
6. [API et architecture](#api-et-architecture)
7. [Depannage](#depannage)
8. [FAQ](#faq)

---

## Guide de demarrage rapide

IA Helper necessite un serveur Ollama pour fonctionner. Ollama est **100% gratuit** et **open source**.

### 3 minutes pour demarrer

1. **Installez Ollama**: [ollama.ai/download](https://ollama.ai/download)
2. **Telechargez un modele**: `ollama pull llama3.2`
3. **Installez l'extension**: Chrome Web Store ou mode developpeur
4. **C'est pret!** Cliquez sur l'icone IA Helper

---

## Installation d'Ollama (detaille)

### Sur Windows

1. Telechargez l'installateur: [ollama.ai/download](https://ollama.ai/download)
2. Executez `OllamaSetup.exe`
3. Ollama demarre automatiquement en arriere-plan
4. Ouvrez PowerShell et tapez:

```powershell
# Telecharger un modele (obligatoire)
ollama pull llama3.2

# Verifier que ca fonctionne
ollama list
```

### Sur macOS

```bash
# Avec Homebrew
brew install ollama

# Ou telechargez depuis ollama.ai/download
# Puis:
ollama pull llama3.2
```

### Sur Linux

```bash
# Installation en une ligne
curl -fsSL https://ollama.ai/install.sh | sh

# Demarrer le service
sudo systemctl start ollama

# Telecharger un modele
ollama pull llama3.2
```

### Quel modele choisir?

| Modele | Taille | Usage | Commande |
|--------|--------|-------|----------|
| **llama3.2** | 4.7 GB | General, recommande | `ollama pull llama3.2` |
| **mistral** | 4.1 GB | Tres bon en francais | `ollama pull mistral` |
| **gemma2** | 5.4 GB | Google, performant | `ollama pull gemma2` |
| **phi3** | 2.2 GB | Leger, rapide | `ollama pull phi3` |
| **qwen2.5** | 4.4 GB | Multilangue | `ollama pull qwen2.5` |

**Conseil**: Commencez par `llama3.2` ou `mistral` pour le francais.

---

## Serveur Ollama distant

Si vous avez un serveur (VPS, VM, NAS), vous pouvez y installer Ollama et l'utiliser depuis n'importe ou.

### Installation sur serveur Linux (Ubuntu/Debian)

```bash
# Connectez-vous en SSH
ssh user@votre-serveur.com

# Installez Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Telecharger un modele
ollama pull llama3.2

# Configurer pour ecouter sur toutes les interfaces
sudo systemctl stop ollama
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf <<EOF
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
EOF
sudo systemctl daemon-reload
sudo systemctl start ollama
```

### Ouvrir le port (pare-feu)

```bash
# UFW (Ubuntu)
sudo ufw allow 11434/tcp

# firewalld (CentOS/RHEL)
sudo firewall-cmd --add-port=11434/tcp --permanent
sudo firewall-cmd --reload
```

### Configuration dans IA Helper

1. Ouvrez les Options de l'extension
2. Dans "URL Ollama", entrez: `http://VOTRE_IP:11434`
3. Testez la connexion
4. Selectionnez votre modele

**Securite**: Pour un usage en production, utilisez un reverse proxy (nginx) avec HTTPS et authentification.

### Docker (alternatif)

```bash
# CPU only
docker run -d -p 11434:11434 --name ollama ollama/ollama

# Avec GPU NVIDIA
docker run -d --gpus=all -p 11434:11434 --name ollama ollama/ollama

# Telecharger un modele
docker exec -it ollama ollama pull llama3.2
```

---

## Installation de l'extension

### Option A: Chrome Web Store (recommande)

*(Bientot disponible)*

### Option B: Mode developpeur

```bash
# Cloner le depot
git clone https://github.com/Gohanado/ia-helper.git
```

1. Ouvrez Chrome > `chrome://extensions/`
2. Activez "Mode developpeur" (toggle en haut a droite)
3. Cliquez "Charger l'extension non empaquetee"
4. Selectionnez le dossier `ia-helper`

### Configuration initiale

1. Cliquez sur l'icone IA Helper
2. Verifiez que le status est "OK" (vert)
3. Cliquez sur "Options" pour personnaliser

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

### 24 Presets Professionnels (140+ actions)

| Categorie | Presets |
|-----------|---------|
| **Tech** | Support IT, Developpeur, Data Analyst |
| **Business** | Commercial, Marketing, Product Manager, Freelance |
| **Communication** | Service Client, Community Manager, Copywriter |
| **Creatif** | Redacteur, Designer UX, Createur Contenu, Journaliste |
| **Education** | Etudiant, Formateur, Chercheur |
| **Specialise** | RH/Recruteur, Manager, Juriste, Traducteur, Sante, E-commerce |
| **Personnel** | Assistant Personnel |

Chaque preset contient 4 a 6 actions specialisees avec des prompts optimises.

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

- [Signaler un bug](https://github.com/Gohanado/ia-helper/issues/new?template=bug_report.md)
- [Demander une fonctionnalite](https://github.com/Gohanado/ia-helper/issues/new?template=feature_request.md)
- [Discussions](https://github.com/Gohanado/ia-helper/discussions)
- [Faire un don](https://paypal.me/gohanado)

---

**Version:** 1.0.0
**Derniere mise a jour:** 2025-11-26

