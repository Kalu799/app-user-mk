# 🔐 05. Authentification : Pages d'accueil, Inscription et Connexion

Ce document décrit la fonctionnalité d'authentification de **Movie King** telle qu'elle est implémentée aujourd'hui, et ce qu'il reste à faire. Il s'appuie sur les principes expliqués dans [04 - Composants et flux de données](./04-composants-et-flux-de-donnees.md).

## 🗂️ Les fichiers concernés

| Fichier | Type | Rôle |
|---|---|---|
| `pages/GuestHomePage.vue` | Page | Accueil visiteur : header gris, logo (lien vers `/`) et lien « Register/login » vers `/auth`. Le `<main>` est vide pour l'instant. |
| `pages/AuthPage.vue` | Page (smart) | Orchestre l'inscription et la connexion : appels API, messages de feedback, bascule entre les deux formulaires. |
| `components/RegisterForm.vue` | Composant (dumb) | Formulaire d'inscription : `pseudo`, `mail`, `password`. Émet `dataFormRegister`. |
| `components/LoginForm.vue` | Composant (dumb) | Formulaire de connexion : `mail`, `password`. Émet `dataFormLogin`. |

## 🧭 Parcours utilisateur

```text
GET /  (GuestHomePage)
   │  clic sur « Register/login »
   ▼
GET /auth  (AuthPage, isLoginMode = false)
   │
   ├── RegisterForm ──► handleRegister ──► POST /api/auth/register
   │                                           │ succès
   │                                           ▼
   │                     message de succès + isLoginMode = true
   │
   └── LoginForm ─────► handleLogin ─────► POST /api/auth/login
                                               │ succès
                                               ▼
                                   message « Connexion réussie ! »
                                   (pas encore de redirection ni de stockage)
```

Le bouton situé sous le formulaire (« J'ai déjà un compte » / « Je n'ai pas encore de compte ») appelle `switchMode()` : il inverse `isLoginMode` et efface les messages d'erreur et de succès. Le titre `<h1>` change en conséquence (« Créer un compte » / « Connexion »).

## 🧩 Contrat des composants

### Événements émis

| Composant | Événement | Données envoyées au parent |
|---|---|---|
| `RegisterForm` | `dataFormRegister` | `{ pseudo, mail, password }` |
| `LoginForm` | `dataFormLogin` | `{ mail, password }` |

Les deux composants suivent le même schéma : état local via une fonction `initial…State()`, `v-model.lazy.trim`, `@submit.prevent`, émission d'une **copie** (`{ ...state.value }`) puis réinitialisation du formulaire.

### États locaux de `AuthPage`

| `ref` | Rôle |
|---|---|
| `isLoginMode` | `false` = formulaire d'inscription (valeur par défaut), `true` = formulaire de connexion |
| `isLoading` | `true` pendant un appel API (affiche « Chargement en cours... ») |
| `errorMsg` | Message d'erreur affiché en rouge |
| `successMsg` | Message de succès affiché en vert |

## 🌐 Contrat API attendu par le front

Le front appelle des URL **relatives**. En développement, elles doivent être redirigées vers le backend (proxy dans `vite.config.js`, voir [01](./01-architecture-config.md)). Le backend est un serveur **Nitro**.

| Action | Requête | Corps JSON |
|---|---|---|
| Inscription | `POST /api/auth/register` | `{ "pseudo": "...", "mail": "...", "password": "..." }` |
| Connexion | `POST /api/auth/login` | `{ "mail": "...", "password": "..." }` |

* **Succès :** réponse HTTP 2xx avec un corps JSON (actuellement seulement affiché dans la console).
* **Erreur :** réponse non 2xx avec un corps JSON contenant `statusMessage`. Ce texte est affiché tel quel à l'utilisateur ; s'il est absent, un message par défaut est utilisé (« Erreur lors de la création du compte » / « Erreur lors de la connexion »).

> Ce contrat est déduit du code front. Il doit être confirmé avec l'implémentation des routes serveur.

## ⚠️ Points d'attention connus

1. **Formulaire vidé avant la réponse du serveur.** `sendData()` réinitialise le formulaire dès l'émission. Si l'API répond par une erreur (mail déjà pris, mauvais mot de passe), l'utilisateur doit tout ressaisir. Piste : laisser la page décider quand vider le formulaire (par exemple en exposant une méthode `reset()` via `defineExpose`, ou en vidant seulement en cas de succès).
2. **Données sensibles dans la console.** `AuthPage.vue` contient des `console.log` de la réponse de l'API (`Nouvel utilisateur`, `Utilisateur connecté`). À supprimer avant toute mise en production.
3. **`navigateTo` n'existe pas dans ce projet.** Le commentaire de `handleLogin` mentionne `navigateTo('/profile')`, qui est une fonction de **Nuxt**. Avec Vue Router, utilisez `const router = useRouter()` puis `router.push('/profile')`.
4. **Stockage du token.** Le commentaire suggère `localStorage.setItem('token', ...)`. Ce stockage est exposé aux attaques XSS. Préférez un cookie `httpOnly` posé par le serveur ; à défaut, gardez le token dans le store Pinia.
5. **Pas de validation côté client.** Aucun attribut `required`, `minlength` ou contrôle de format n'est défini sur les champs : un formulaire vide peut être soumis. La validation côté serveur reste indispensable dans tous les cas.
6. **Langue de l'interface mélangée.** Titres de formulaires et boutons en anglais (« Register Form », « Register », « Register/login »), mais pages et messages en français (« Connexion », « Se connecter »). À uniformiser.
7. **Styles dupliqués.** `RegisterForm.vue` et `LoginForm.vue` ont des blocs `<style scoped>` quasi identiques (`.form-wrapper`, `input`, `button`…), et le header est répété dans `AuthPage.vue` et `GuestHomePage.vue`. Candidats à l'extraction en composants partagés (ex : `AppHeader.vue`, `AuthFormWrapper.vue`).
8. **Logo.** Le fichier `public/Property 1=king.png` a un nom fragile (voir [01](./01-architecture-config.md#le-dossier-public)).

## ✅ Ce qui reste à faire

* **Créer `stores/auth.js` (Pinia)** : stocker l'utilisateur connecté (et le token si besoin), avec des actions `login`, `logout`. `AuthPage` appellerait l'action au lieu de faire le `fetch` directement.
* **Rediriger après connexion** (ex : vers une page profil ou un catalogue de films) avec `router.push`.
* **Protéger les routes** privées avec une garde de navigation (`router.beforeEach`) qui vérifie `auth.user`.
* **Remplir `GuestHomePage`** : le `<main>` est vide.
* **Ajouter la validation** des formulaires et un état « chargement » sur les boutons (désactivés pendant `isLoading`).

## 🧪 Pas à pas : ajouter un nouveau formulaire

1. Créer le composant dans `components/` : état local via `initial…State()`, `defineEmits(['dataForm<Action>'])`, `@submit.prevent`.
2. Dans la page : importer le composant, écouter `@dataForm<Action>="handle<Action>"`.
3. Écrire `handle<Action>` en suivant le modèle de `handleRegister` : remise à zéro des messages, `try / catch / finally`, `isLoading` géré dans le `finally`.
4. Ne passer par Pinia que si le résultat doit être partagé entre plusieurs pages.
