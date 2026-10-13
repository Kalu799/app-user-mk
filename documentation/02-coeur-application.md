# 💻 02. Le cœur de l'application (Dossier `/src`)

Tout le code métier, les composants et la logique se trouvent dans le dossier `src/`.

## 🚀 Le point d'entrée : `main.js` et `App.vue`
* **`main.js`** : C'est le premier fichier JavaScript exécuté. Son rôle est de créer l'instance de l'application Vue (`createApp`), d'y attacher les plugins comme **Pinia** (store) et **Vue Router**, puis de monter l'application sur le DOM (`#app`).
* **`App.vue`** : C'est le composant racine. Tous les autres composants de l'application seront affichés à l'intérieur de celui-ci, généralement via la balise `<RouterView />` qui change le contenu selon l'URL.

## 🛣️ Le Routage (`/src/router/`)
Nous utilisons **Vue Router 4**.
* **`index.js`** : Contient la définition de toutes les routes de l'application (ex: `/`, `/login`, `/register`).
* **Bonne pratique :** Toujours utiliser le composant `<RouterLink to="...">` plutôt que la balise `<a>` pour naviguer entre les pages sans recharger le navigateur.

## 📦 La gestion d'état (`/src/stores/`)
Nous utilisons **Pinia** (le successeur officiel de Vuex) pour gérer les données globales de l'application (l'utilisateur connecté, le panier, etc.).
* **`counter.js`** : Un store d'exemple généré par défaut. Il montre comment utiliser la Composition API (`ref`, `computed`, `function`) au sein d'un store Pinia.
* **Architecture :** Créez un fichier par thématique (ex: `auth.js` pour l'authentification, `movies.js` pour les films).