# 💻 02. Le cœur de l'application (Dossier `/src`)

Tout le code métier, les composants et la logique se trouvent dans le dossier `src/`.

## 📂 Structure de `src/`
```text
src/
├── main.js               # Point d'entrée JS (createApp, Pinia, Router)
├── App.vue               # Composant racine (<RouterView />)
├── router/
│   └── index.js          # Définition des routes
├── stores/
│   └── counter.js        # Store d'exemple
├── pages/                # Pages : GuestHomePage.vue, AuthPage.vue, HomePage.vue
└── components/           # Composants « bêtes » : RegisterForm.vue, LoginForm.vue
```

## 🚀 Le point d'entrée : `main.js` et `App.vue`
* **`main.js`** : C'est le premier fichier JavaScript exécuté. Son rôle est de créer l'instance de l'application Vue (`createApp`), d'y attacher les plugins comme **Pinia** (store) et **Vue Router**, puis de monter l'application sur le DOM (`#app`).
* **`App.vue`** : C'est le composant racine. Tous les autres composants de l'application seront affichés à l'intérieur de celui-ci, généralement via la balise `<RouterView />` qui change le contenu selon l'URL.

## 🛣️ Le Routage (`/src/router/`)
Nous utilisons **Vue Router 4**.
* **`index.js`** : Contient la définition de toutes les routes de l'application.

### Routes actuelles

| URL | Page | Rôle |
|---|---|---|
| `/` | `GuestHomePage.vue` | Page d'accueil visiteur : logo + lien « Register/login » |
| `/auth` | `AuthPage.vue` | Inscription **et** connexion sur la même page (bascule entre les deux formulaires) |

> ℹ️ Il n'y a **pas** de routes `/login` ni `/register` séparées : les deux formulaires vivent sur `/auth` et la page alterne entre eux (voir [05 - Authentification](./05-authentification.md)).
> Ce tableau est déduit des `RouterLink` des pages. Vérifiez-le et complétez-le avec le contenu réel de `router/index.js`.

* **Bonne pratique :** Toujours utiliser le composant `<RouterLink to="...">` plutôt que la balise `<a>` pour naviguer entre les pages sans recharger le navigateur. Importez-le explicitement (`import { RouterLink } from 'vue-router'`) comme dans `GuestHomePage.vue`, pour rester homogène dans toutes les pages (`AuthPage.vue` l'utilise sans import, ce qui fonctionne grâce à l'enregistrement global du plugin router).
* **Navigation par code :** pour rediriger après une action (ex : après connexion), utilisez `useRouter().push('/chemin')`.

## 📦 La gestion d'état (`/src/stores/`)
Nous utilisons **Pinia** (le successeur officiel de Vuex) pour gérer les données globales de l'application (l'utilisateur connecté, le panier, etc.).
* **`counter.js`** : Un store d'exemple généré par défaut. Il montre comment utiliser la Composition API (`ref`, `computed`, `function`) au sein d'un store Pinia.
* **Architecture :** Créez un fichier par thématique (ex: `auth.js` pour l'authentification, `movies.js` pour les films).
* **Authentification :** le flux d'authentification appelle l'API directement depuis les pages, sans Pinia ; voir [05 - Authentification](./05-authentification.md).
