# 🛠️ 03. Outils, Environnement et Bonnes Pratiques

Pour garantir que tous les développeurs de l'équipe travaillent de la même manière, nous avons mis en place plusieurs fichiers de configuration d'environnement.

## 📝 Formatage du code (Prettier)
Le projet utilise **Prettier** pour formater le code automatiquement (espaces, guillemets, indentation).
* **`.prettierrc.json`** : Contient les règles de formatage de l'équipe. Votre éditeur de code s'appuiera sur ce fichier pour formater vos fichiers `.js` et `.vue` lors de la sauvegarde. **Ne modifiez pas ce fichier sans l'accord de l'équipe.**

## 💻 Configuration VS Code (`.vscode/`)
Ce dossier est très utile pour l'onboarding de nouveaux développeurs sur VS Code.
* **`extensions.json`** : Contient une liste d'extensions recommandées (comme Vue Volar, Prettier). Lorsque vous ouvrez ce projet dans VS Code pour la première fois, l'éditeur vous proposera automatiquement d'installer ces extensions essentielles.

## 🙈 Git et fichiers ignorés (`.gitignore`)
Ce fichier indique à Git quels fichiers ne doivent **jamais** être envoyés sur le dépôt distant (GitHub/GitLab) :
* `node_modules/` : Trop lourd, chaque dev doit générer le sien via `npm install`.
* `.env` / `.env.local` : **Très important**, ces fichiers contiendront nos clés secrètes et mots de passe. Ils ne doivent jamais être versionnés.

---

### 🗑️ Fichiers temporaires ou à nettoyer (À l'attention du Lead Dev)
*Note : Le fichier `inutile.html` présent à la racine est un fichier de test ("test"). Il devrait être supprimé lors du prochain commit de nettoyage.*