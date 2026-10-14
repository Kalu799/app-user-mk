# 🔄 04. Composants, Pages et Flux de Données (Data Flow)

Dans ce projet, nous séparons strictement la logique d'affichage (les Composants) de la logique métier/API (les Pages). Ce document explique comment ces éléments communiquent entre eux.

## 🧱 La différence entre Pages et Composants

### 1. Les Composants (`/src/components/`)
Ce sont les blocs de construction de l'interface (ex: `RegisterForm.vue`, `AppButton.vue`).
* **Ils sont "bêtes" (Dumb Components) :** Un composant ne doit (idéalement) pas faire d'appels à l'API ni modifier la base de données directement.
* **Leur rôle :** Afficher du HTML/CSS, capturer les saisies de l'utilisateur, et prévenir le parent (la Page) quand il se passe quelque chose.

### 2. Les Pages (`/src/pages/` ou vues via le router)
Ce sont les chefs d'orchestre (ex: `Auth.vue`).
* **Elles sont "intelligentes" (Smart Components) :** Elles gèrent les appels à l'API (fetch), communiquent avec le Store (Pinia), et décident de ce qui doit s'afficher.
* **Leur rôle :** Importer les composants, leur passer des données, et écouter leurs événements pour déclencher des actions globales.

---

## 🌊 Le Flux de Données : L'exemple de l'Inscription

Pour comprendre comment la donnée voyage de l'utilisateur jusqu'à la base de données, prenons l'exemple de notre système d'inscription.

### Étape 1 : Le Composant capture la donnée (État local)
Dans `components/RegisterForm.vue`, l'utilisateur tape son pseudo, son mail et son mot de passe.
Nous utilisons un état local (`ref`) pour stocker ces saisies temporairement :

\`\`\`vue
// Dans RegisterForm.vue
const newRegister = ref({
  pseudo: "",
  mail: "",
  password: ""
})
\`\`\`
*La directive `v-model` dans le template met à jour cet objet automatiquement à chaque touche pressée.*

### Étape 2 : Le Composant remonte la donnée vers la Page (Le `$emit`)
Quand l'utilisateur clique sur le bouton "Register", le composant ne contacte pas l'API. Il **crie** à la page parente que le formulaire a été soumis, en lui jetant les données via un `emit`.

\`\`\`vue
// Dans RegisterForm.vue
const emits = defineEmits(['dataFormRegister'])

const sendData = () => {
  // On envoie une copie des données au parent sous le nom 'dataFormRegister'
  emits('dataFormRegister', { ...newRegister.value })
}
\`\`\`

### Étape 3 : La Page écoute l'événement et reçoit la donnée
Dans `pages/Auth.vue`, nous appelons le composant. Nous plaçons un "écouteur" (`@`) sur le nom de l'événement défini par l'enfant (`dataFormRegister`).

\`\`\`vue
<!-- Dans Auth.vue -->
<template>
  <RegisterForm @dataFormRegister="handleRegister" />
</template>
\`\`\`
*Traduction : "Quand le RegisterForm crie `dataFormRegister`, exécute ma fonction locale `handleRegister`".*

### Étape 4 : La Page traite la donnée (Appel API)
La page `Auth.vue` récupère enfin les données saisies et se charge du travail lourd : contacter le serveur backend.

\`\`\`vue
// Dans Auth.vue
const handleRegister = async (userData) => {
  isLoading.value = true
  
  try {
    // 1. Appel au serveur backend (API Nitro)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData) // userData contient pseudo, mail, password
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error("Erreur serveur")
    }
    
    // 2. Gestion du succès (ex: afficher LoginForm, vider les erreurs...)
    successMsg.value = "Compte créé !"

  } catch (error) {
    // 3. Gestion de l'erreur (ex: email déjà pris)
    errorMsg.value = error.message
  }
}
\`\`\`

---

## 🧠 Quand utiliser Pinia (Les Stores) ?

Dans l'exemple ci-dessus, nous n'avons pas utilisé Pinia. Pourquoi ?
Parce que l'état d'un formulaire d'inscription est **éphémère** et **local**. Une fois le compte créé, on n'a plus besoin de retenir le mot de passe tapé dans les autres pages.

**Il faut utiliser un Store Pinia (`/src/stores/`) uniquement quand une donnée doit survivre à un changement de page et être accessible partout :**
* 🟢 **OUI pour Pinia :** L'utilisateur actuellement connecté (`auth.user`), son token d'authentification, le thème sombre/clair du site, les articles dans un panier.
* 🔴 **NON pour Pinia :** Le texte en train d'être tapé dans une barre de recherche, les champs d'un formulaire, un spinner de chargement spécifique à un bouton.