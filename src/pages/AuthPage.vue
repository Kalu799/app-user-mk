<script setup>
import { ref } from 'vue'
import RegisterForm from '@/components/RegisterForm.vue'

// Variables réactives pour gérer l'état de la requête dans la page
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleRegister = async (userData) => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // Appel direct à ton API Nitro (d'après ta doc serveur)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData) // userData contient pseudo, email et password envoyés par l'emit
    })

    const data = await response.json()

    if (!response.ok) {
      // Si on a une erreur HTTP (comme la 409 pour doublon que tu as prévue)
      throw new Error(data.statusMessage || 'Erreur lors de la création du compte')
    }

    // Succès !
    successMsg.value = "Compte créé avec succès !"
    console.log("ID du nouvel utilisateur :", data.userId)

    // Ici tu pourras gérer la suite, par exemple changer une variable pour 
    // afficher le composant LoginForm.vue à la place du RegisterForm.vue

  } catch (error) {
    console.error("Erreur d'inscription:", error)
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-layout">
    <header class="header">
      <RouterLink to="/"><img src="/Property 1=king.png" alt="Movie King Logo" class="logo" /></RouterLink>
    </header>

    <main class="main-content">
      <h1 class="page-title">Créer un compte</h1>

      <!-- Écoute de l'emit et appel direct de notre fonction locale -->
      <RegisterForm @dataFormRegister="handleRegister" />

      <!-- Messages de feedback gérés directement par la page -->
      <p v-if="isLoading" class="msg info">Chargement en cours...</p>
      <p v-if="errorMsg" class="msg error">{{ errorMsg }}</p>
      <p v-if="successMsg" class="msg success">{{ successMsg }}</p>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  font-family: sans-serif;
}

.header {
  background-color: #dcdcdc;
  width: 100%;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  height: 60px;
  object-fit: contain;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 24px;
}

/* Styles pour les messages de feedback */
.msg {
  margin-top: 16px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  width: 100%;
  max-width: 300px;
}

.info {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.error {
  background-color: #ffebee;
  color: #c62828;
}

.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

@media (min-width: 768px) {
  .main-content {
    max-width: 500px;
    margin: 0 auto;
  }
}
</style>