# Prompt de Test Complet - IA Helper Chat

Copie ce prompt dans le chat pour tester TOUS les elements d'affichage Markdown possibles :

---

# Guide Complet de Test Markdown

Bienvenue dans ce guide de test ultra-complet qui couvre **tous** les elements Markdown possibles.

## 1. Titres et Hierarchie

# Titre H1 - Niveau Principal
## Titre H2 - Sous-section
### Titre H3 - Sous-sous-section
#### Titre H4 - Niveau 4
##### Titre H5 - Niveau 5
###### Titre H6 - Niveau 6

---

## 2. Formatage de Texte

Voici du **texte en gras** et du *texte en italique*.

On peut aussi combiner : ***gras et italique ensemble***.

Du ~~texte barre~~ pour les corrections.

Du `code inline` pour les commandes courtes comme `npm install` ou `git commit`.

---

## 3. Listes

### Listes non ordonnees

- Premier element
- Deuxieme element
  - Sous-element 1
  - Sous-element 2
    - Sous-sous-element
- Troisieme element

### Listes ordonnees

1. Premiere etape
2. Deuxieme etape
   1. Sous-etape A
   2. Sous-etape B
3. Troisieme etape

### Listes de taches

- [x] Tache completee
- [x] Autre tache terminee
- [ ] Tache en cours
- [ ] Tache a faire

---

## 4. Citations et Blockquotes

> Ceci est une citation simple.

> Ceci est une citation
> sur plusieurs lignes
> pour tester l'affichage.

> **Citation avec formatage**
> 
> On peut mettre du *texte en italique* et du `code` dans les citations.

---

## 5. Code Blocks

### Code Bash

```bash
#!/bin/bash
# Script de sauvegarde
sudo apt update
sudo apt install restic
restic backup /home/user/documents --tag daily
```

### Code Python

```python
def fibonacci(n):
    """Calcule la suite de Fibonacci"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

### Code JavaScript

```javascript
// Fonction asynchrone
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

### Code SQL

```sql
-- Requete complexe
SELECT u.name, COUNT(o.id) as total_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id
HAVING COUNT(o.id) > 5
ORDER BY total_orders DESC;
```

### Code sans langage specifie

```
Ceci est un bloc de code
sans langage specifie
pour tester l'affichage par defaut
```

---

## 6. Tableaux

### Tableau simple

| Nom | Age | Ville |
|-----|-----|-------|
| Alice | 25 | Paris |
| Bob | 30 | Lyon |
| Charlie | 35 | Marseille |

### Tableau avec alignement

| Gauche | Centre | Droite |
|:-------|:------:|-------:|
| A | B | C |
| 1 | 2 | 3 |
| X | Y | Z |

### Tableau complexe

| Fonctionnalite | Description | Statut | Priorite |
|----------------|-------------|--------|----------|
| Authentification | Systeme de login securise | Complete | Haute |
| API REST | Endpoints pour CRUD | En cours | Haute |
| Dashboard | Interface utilisateur | A faire | Moyenne |
| Tests | Suite de tests unitaires | A faire | Basse |

---

## 7. Formules Mathematiques LaTeX

### Formules inline

La formule de Pythagore est \( a^2 + b^2 = c^2 \).

L'equation d'Einstein : \( E = mc^2 \).

Une integrale : \( \int_0^1 x^2 dx = \frac{1}{3} \).

### Formules block

Equation quadratique :

\[ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \]

Somme de Riemann :

\[ \sum_{i=1}^{n} i = \frac{n(n+1)}{2} \]

Gradient descent :

\[ w \leftarrow w - \eta \frac{\partial L}{\partial w} \]

---

## 8. Liens et References

Voici un [lien vers Google](https://www.google.com).

Lien avec titre : [GitHub](https://github.com "Plateforme de code").

URL directe : https://www.example.com

---

## 9. Images

![Logo Markdown](https://markdown-here.com/img/icon256.png)

![Image avec titre](https://via.placeholder.com/150 "Image de test")

---

## 10. Lignes Horizontales

Voici une ligne horizontale :

---

Et une autre :

***

---

## 11. Code Mixte avec Explications

Voici comment creer un serveur Node.js :

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});

server.listen(3000, '127.0.0.1');
console.log('Serveur demarre sur http://127.0.0.1:3000/');
```

Pour lancer ce serveur, utilisez la commande `node server.js`.

---

## 12. Exemples Complexes Imbriques

### Configuration Docker avec explications

Voici un `Dockerfile` complet :

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

Pour construire l'image :

```bash
docker build -t mon-app .
docker run -p 3000:3000 mon-app
```

**Important** : Assurez-vous d'avoir Docker installe avec `docker --version`.

---

## 13. Tableau avec Code Inline

| Commande | Description | Exemple |
|----------|-------------|---------|
| `git init` | Initialise un repo | `git init mon-projet` |
| `git add` | Ajoute des fichiers | `git add .` |
| `git commit` | Cree un commit | `git commit -m "message"` |
| `git push` | Envoie vers remote | `git push origin main` |

---

## 14. Citations avec Code

> **Conseil de pro**
>
> Utilisez toujours `git status` avant de faire un commit pour verifier les fichiers modifies.
>
> ```bash
> git status
> git add fichier.txt
> git commit -m "Ajout fichier"
> ```

---

## 15. Liste avec Sous-elements et Code

1. **Installation**
   - Telecharger Node.js
   - Verifier avec `node --version`
   - Installer npm avec `npm install -g npm`

2. **Configuration**
   ```json
   {
     "name": "mon-projet",
     "version": "1.0.0",
     "scripts": {
       "start": "node index.js"
     }
   }
   ```

3. **Lancement**
   - Executer `npm start`
   - Ouvrir http://localhost:3000

---

## 16. Recap Final

Ce guide a teste :

- [x] Tous les niveaux de titres (H1-H6)
- [x] Formatage texte (gras, italique, barre, code inline)
- [x] Listes (ordonnees, non ordonnees, taches)
- [x] Citations (simples, multiples, avec formatage)
- [x] Code blocks (avec et sans langage)
- [x] Tableaux (simples, alignes, complexes)
- [x] Formules LaTeX (inline et block)
- [x] Liens et images
- [x] Lignes horizontales
- [x] Combinaisons complexes

**Resultat attendu** : Tous les elements doivent s'afficher correctement avec les styles appropries.

**Fin du test complet!**
