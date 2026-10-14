# 🔄 04. Composants, Pages et Flux de Données (Data Flow)

Dans ce projet, nous séparons strictement la logique d'affichage (les Composants) de la logique métier/API (les Pages). Ce document explique comment ces éléments communiquent entre eux.

## 🧱 La différence entre Pages et Composants

### 1. Les Composants (`/src/components/`)
Ce sont les blocs de construction de l'interface (ex: `RegisterForm.vue`, `LoginForm.vue`).
* **Ils sont "bêtes" (Dumb Components) :** Un composant ne doit (idéalement) pas faire d'appels à l'API ni modifier la base de données directement.
* **Leur rôle :** Afficher du HTML/CSS, capturer les saisies de l'utilisateur, et prévenir le parent (la Page) quand il se passe quelque chose.

### 2. Les Pages (`/src/pages/` ou vues via le router)
Ce sont les chefs d'orchestre (ex: `AuthPage.vue`, `GuestHomePage.vue`).
* **Elles sont "intelligentes" (Smart Components) :** Elles gèrent les appels à l'API (fetch), communiquent avec le Store (Pinia), et décident de ce qui doit s'afficher.
* **Leur rôle :** Importer les composants, leur passer des données, et écouter leurs événements pour déclencher des actions globales.
* Une page statique comme `GuestHomePage.vue` n'a pas de logique : elle n'affiche que le header et un `RouterLink` vers `/auth`.

### 📛 Conventions de nommage
* Les **pages** portent le suffixe `Page` : `AuthPage.vue`, `GuestHomePage.vue`.
* Les **composants** décrivent leur contenu : `RegisterForm.vue`, `LoginForm.vue`.
* Les **événements** émis par un composant sont nommés `dataForm<Action>` : `dataFormRegister`, `dataFormLogin`.

---

## 🌊 Le Flux de Données : L'exemple de l'Inscription

Pour comprendre comment la donnée voyage de l'utilisateur jusqu'à la base de données, prenons l'exemple de notre système d'inscription. Le flux de **connexion** est strictement identique (voir [05 - Authentification](./05-authentification.md)) : seuls changent l'événement (`dataFormLogin`), les champs (`mail`, `password`) et l'URL appelée (`/api/auth/login`).

### Étape 1 : Le Composant capture la donnée (État local)
Dans `components/RegisterForm.vue`, l'utilisateur tape son pseudo, son mail et son mot de passe.
Nous utilisons un état local (`ref`) pour stocker ces saisies temporairement. L'état initial est produit par une **fonction**, ce qui permet de réinitialiser le formulaire proprement :

```vue
// Dans RegisterForm.vue
const initialRegisterState = () => ({
  pseudo: "",
  mail: "",
  password: ""
})

const newRegister = ref(initialRegisterState())
```
*La directive `v-model.lazy.trim` dans le template met à jour cet objet automatiquement : `.lazy` synchronise à la sortie du champ (événement `change`) et non à chaque touche, `.trim` supprime les espaces en début et fin de saisie.*

### Étape 2 : Le Composant remonte la donnée vers la Page (Le `$emit`)
Quand l'utilisateur soumet le formulaire (`@submit.prevent`, qui empêche le rechargement de la page), le composant ne contacte pas l'API. Il **crie** à la page parente que le formulaire a été soumis, en lui jetant les données via un `emit`, puis il se vide.

```vue
// Dans RegisterForm.vue
const emits = defineEmits(['dataFormRegister'])

const sendData = () => {
  // On envoie une copie des données au parent sous le nom 'dataFormRegister'
  emits('dataFormRegister', { ...newRegister.value })
  // Reset du formulaire
  newRegister.value = initialRegisterState()
}
```
> ⚠️ Le formulaire est vidé **immédiatement**, avant même de savoir si l'API a accepté la requête. En cas d'erreur serveur, l'utilisateur doit tout retaper (voir les points d'attention dans [05](./05-authentification.md#-points-dattention-connus)).

### Étape 3 : La Page écoute l'événement et reçoit la donnée
Dans `pages/AuthPage.vue`, nous appelons le composant. Nous plaçons un "écouteur" (`@`) sur le nom de l'événement défini par l'enfant (`dataFormRegister`).

```vue
<!-- Dans AuthPage.vue -->
<template>
  <RegisterForm v-if="!isLoginMode" @dataFormRegister="handleRegister" />
  <LoginForm v-else @dataFormLogin="handleLogin" />
</template>
```
*Traduction : "Quand le RegisterForm crie `dataFormRegister`, exécute ma fonction locale `handleRegister`".*
*La page affiche l'un ou l'autre formulaire selon `isLoginMode`.*

### Étape 4 : La Page traite la donnée (Appel API)
La page `AuthPage.vue` récupère enfin les données saisies et se charge du travail lourd : contacter le serveur backend, puis informer l'utilisateur du résultat.

```vue
// Dans AuthPage.vue
const handleRegister = async (userData) => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // 1. Appel au serveur backend (API Nitro)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData) // userData contient pseudo, mail, password
    })

    const data = await response.json()

    if (!response.ok) {
      // Nitro renvoie le message d'erreur dans `statusMessage`
      throw new Error(data.statusMessage || 'Erreur lors de la création du compte')
    }

    // 2. Gestion du succès : message + bascule vers le formulaire de connexion
    successMsg.value = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
    isLoginMode.value = true

  } catch (error) {
    // 3. Gestion de l'erreur (ex: email déjà pris)
    errorMsg.value = error.message
  } finally {
    // 4. Dans tous les cas, on arrête le chargement
    isLoading.value = false
  }
}
```
Les trois états de feedback (`isLoading`, `errorMsg`, `successMsg`) sont des `ref` **locaux à la page** et s'affichent sous le formulaire. Ils sont remis à zéro au début de chaque requête et à chaque bascule entre inscription et connexion (`switchMode`).

---

## 🧠 Quand utiliser Pinia (Les Stores) ?

Dans l'exemple ci-dessus, nous n'avons pas utilisé Pinia. Pourquoi ?
Parce que l'état d'un formulaire d'inscription est **éphémère** et **local**. Une fois le compte créé, on n'a plus besoin de retenir le mot de passe tapé dans les autres pages.

**Il faut utiliser un Store Pinia (`/src/stores/`) uniquement quand une donnée doit survivre à un changement de page et être accessible partout :**
* 🟢 **OUI pour Pinia :** L'utilisateur actuellement connecté (`auth.user`), son token d'authentification, le thème sombre/clair du site, les articles dans un panier.
* 🔴 **NON pour Pinia :** Le texte en train d'être tapé dans une barre de recherche, les champs d'un formulaire, un spinner de chargement spécifique à un bouton, les messages `errorMsg` / `successMsg` de `AuthPage`.

> 🔜 Le résultat de la **connexion** (utilisateur / token) est typiquement une donnée « OUI pour Pinia » : elle n'est pas encore stockée. Voir [05 - Authentification](./05-authentification.md#-ce-qui-reste-à-faire).
