# 🏗️ 01. Architecture et Configuration Globale

Le projet utilise **Vite** comme outil de build. Il est beaucoup plus rapide que Webpack car il utilise les modules ES natifs du navigateur pendant le développement.

## 📂 L'arborescence à la racine
```text
/
├── public/               # Ressources statiques non traitées par Vite (favicon, logo)
├── src/                  # Code source de l'application (Vue, JS, CSS)
├── index.html            # Point d'entrée principal de l'application
├── package.json          # Liste des dépendances (Vue, Pinia, etc.) et scripts
├── package-lock.json     # Verrouille les versions exactes des dépendances
├── vite.config.js        # Configuration du bundler Vite
└── jsconfig.json         # Configuration pour l'autocomplétion des chemins (IDE)
```

> 📌 Pour le détail du dossier `src/`, voir [02 - Le cœur de l'application](./02-coeur-application.md).

## ⚙️ Les fichiers de configuration en détail

### `index.html`
Contrairement à d'anciens frameworks Vue (CLI), **Vite utilise `index.html` comme point d'entrée principal**.
* C'est ici que l'application Vue est montée via la balise `<div id="app"></div>`.
* Vite injecte automatiquement le fichier `src/main.js` grâce à la balise `<script type="module" src="/src/main.js"></script>`.

### `vite.config.js`
C'est la configuration du serveur de développement et du build de production.
* Il inclut le plugin Vue (`@vitejs/plugin-vue`) pour compiler les fichiers `.vue`.
* C'est ici que vous définirez vos proxy d'API si vous avez un backend local pour éviter les problèmes de CORS. Le front appelle des routes relatives (`/api/auth/register`, `/api/auth/login`) : en développement, ces appels doivent donc être redirigés vers le serveur backend (voir [05 - Authentification](./05-authentification.md#-contrat-api-attendu-par-le-front)).

### `jsconfig.json`
Ce fichier aide votre éditeur de code (VS Code) à comprendre les **alias de chemins**. Par exemple, il permet à l'IDE de comprendre que l'import `@/components/RegisterForm.vue` pointe vers `src/components/RegisterForm.vue`. C'est la forme d'import utilisée dans les pages (ex : `AuthPage.vue`).

### Le dossier `/public`
Contient les assets qui ne changent jamais et qui n'ont pas besoin d'être compilés. Ces fichiers sont servis directement à la racine du site : `public/favicon.ico` est accessible via `/favicon.ico`.

Il contient actuellement :

| Fichier | Utilisation |
|---|---|
| `favicon.ico` | Icône de l'onglet du navigateur |
| `Property 1=king.png` | Logo « Movie King », référencé par `src="/Property 1=king.png"` dans `AuthPage.vue` et `GuestHomePage.vue` |

> ⚠️ **À améliorer :** le nom `Property 1=king.png` (espace et signe `=`, hérité d'un export Figma) est fragile dans les URL. Renommez-le par exemple en `logo-movie-king.png` et mettez à jour les deux `src` concernés.
