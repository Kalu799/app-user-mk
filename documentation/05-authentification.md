# Authentification et communication avec l'API

L'application Vue ne se connecte jamais directement à MySQL. Elle appelle les routes Nitro du CMS, qui seules accèdent à la base de données. L'API utilise notamment les tables `users` et `auth_sessions`.

## Parcours et fichiers

| Fichier | Rôle |
|---|---|
| `src/pages/AuthPage.vue` | Reçoit les données des formulaires, appelle directement l'API et navigue vers `/homepage` après une connexion réussie. |
| `src/components/RegisterForm.vue` | Émet `{ pseudo, mail, password }` à l'inscription. |
| `src/components/LoginForm.vue` | Émet `{ mail, password }` à la connexion. |
| `src/pages/HomePage.vue` | Vérifie le JWT avec `me`, affiche le pseudo et appelle `logout` à la déconnexion. |
| `vite.config.js` | En développement, relaie `/api/*` vers le CMS en ligne. |
| `vercel.json` | En production, relaie `/api/*` vers le CMS avant la règle de repli SPA. |

L'authentification n'utilise **pas Pinia**. Les composants de formulaire émettent leurs données vers `AuthPage.vue`, puis cette page effectue directement les requêtes `fetch`. Le profil utilisateur reste dans l'état local de la page concernée ; il n'est pas placé dans un store global.

## Routes utilisées

Toutes les requêtes partent de l'origine de l'application et utilisent le préfixe `/api/auth`. Le navigateur ne contacte donc pas directement le domaine du CMS.

| Fonction | Méthode et chemin | Corps / en-tête |
|---|---|---|
| Inscription | `POST /api/auth/register` | `{ "pseudo": "...", "mail": "...", "password": "..." }` |
| Connexion | `POST /api/auth/login` | `{ "mail": "...", "password": "..." }` |
| Utilisateur courant | `GET /api/auth/me` | En-tête d'autorisation Bearer contenant le JWT |
| Déconnexion | `POST /api/auth/logout` | En-tête d'autorisation Bearer contenant le JWT |

L'inscription crée l'utilisateur mais ne le connecte pas. La connexion renvoie un JWT et un profil public. `me` vérifie le JWT et la session en base ; `logout` révoque la session en base.

## Gestion du JWT dans l'application

Après une connexion réussie, `AuthPage.vue` conserve uniquement le JWT dans `sessionStorage`, puis redirige vers `/homepage`. `HomePage.vue` vérifie le JWT en appelant `GET /api/auth/me`, garde le profil renvoyé dans un `ref` local à cette page, puis affiche le pseudo. Une réponse 401 efface le JWT et redirige vers `/auth`. La déconnexion appelle directement `POST /api/auth/logout`, efface le JWT et renvoie vers `/guesthome`. Aucun cookie, `credentials: 'include'` ou store Pinia n'est utilisé pour ce flux.

Le jeton n'est conservé que dans l'onglet courant : `sessionStorage` est effacé à la fermeture de l'onglet. Comme tout stockage accessible au JavaScript, il reste exposé en cas de faille XSS ; ne pas y stocker de mot de passe ou d'autres secrets.

## Pourquoi le navigateur affichait « Failed to fetch »

La page construisait son URL à partir de `VITE_API_BASE_URL` et appelait directement `https://nuxt-app-mk.vercel.app`. Depuis `http://localhost:5173`, le navigateur envoyait donc une requête inter-origines avec prévol CORS. Le CMS ne renvoyait pas `Access-Control-Allow-Origin` pour cette origine (le port Vite `5173` n'était pas dans les origines par défaut ; une URL d'origine terminée par `/` ne correspond pas non plus à l'en-tête `Origin`). Le navigateur bloquait la requête avant que le CMS ne traite l'inscription. Les tests Insomnia fonctionnaient car Insomnia n'applique pas la politique CORS du navigateur.

Le correctif fait passer les appels par `/api` :

* En local, le proxy Vite relaie `/api/*` au CMS.
* Sur Vercel, une règle de réécriture relaie `/api/*` au CMS avant le fallback SPA.

Pour le navigateur, la requête est désormais de même origine que l'application. Il n'y a donc pas besoin d'activer CORS pour ces appels. Le middleware CORS du CMS demeure utile aux autres clients web qui appelleraient directement son domaine.

## Mise en ligne et configuration des domaines

L'application peut être déployée séparément du CMS sur Vercel. Vérifier les points suivants :

1. Configurer le projet Vercel de l'app avec la racine `App/app-user-mk` et lancer le build `npm run build`.
2. Garder dans `vercel.json` la réécriture API vers `https://nuxt-app-mk.vercel.app`. Si le domaine du CMS change, modifier la destination puis redéployer l'app.
3. La configuration Vite sert uniquement au développement local et ne détermine pas la destination en production.
4. Les variables privées `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` et `JWT_SECRET` restent définies uniquement dans le projet Vercel du CMS. Elles ne doivent pas être ajoutées au projet de l'app ni à une variable `VITE_*`.
5. Le CMS doit autoriser son accès réseau à la base MySQL distante et la table `auth_sessions` doit exister (voir `CMS/nuxt-app-mk/sql/create_sessions.sql`). Le dump SQL fourni contient `users`, mais ne remplace pas la création de cette table de sessions.
6. Le domaine personnalisé de l'app n'a pas besoin d'être ajouté aux règles de routage si la réécriture API Vercel est conservée. Si des pages web appellent directement le domaine du CMS, ajouter l'origine exacte (protocole + hôte, sans chemin ni barre finale) à `CORS_ORIGINS` sur le CMS.

## Tester

En local, lancer `npm run dev`, ouvrir `/auth`, puis créer un compte et se connecter. Après le succès de `POST /api/auth/login`, l'application navigue vers `/homepage`. Le navigateur doit appeler `/api/auth/...` sur l'origine locale ; il ne doit pas appeler directement `nuxt-app-mk.vercel.app`.

Sur `/homepage`, vérifier le profil récupéré via `me`, puis utiliser « Déconnexion » pour révoquer la session. Pour contrôler la réponse de l'API sans l'interface, Insomnia peut continuer à appeler `https://nuxt-app-mk.vercel.app/api/auth/...` directement.
