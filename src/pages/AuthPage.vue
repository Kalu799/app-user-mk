<script setup>
import { ref } from 'vue'
import RegisterForm from '@/components/RegisterForm.vue'
import LoginForm from '@/components/LoginForm.vue'

// État de l'affichage
const isLoginMode = ref(false)

// États de feedback
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

/**
 * Inscription
 */
const handleRegister = async (userData) => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.statusMessage ||
        'Erreur lors de la création du compte'
      )
    }

    successMsg.value =
      'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'

    console.log('Nouvel utilisateur :', data)

    // Affiche automatiquement le formulaire de connexion
    isLoginMode.value = true

  } catch (error) {
    console.error("Erreur d'inscription :", error)
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}

/**
 * Connexion
 */
const handleLogin = async (loginData) => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.statusMessage ||
        'Erreur lors de la connexion'
      )
    }

    successMsg.value = 'Connexion réussie !'

    console.log('Utilisateur connecté :', data)

    // Exemple si ton API renvoie un token
    // localStorage.setItem('token', data.token)

    // Exemple de redirection
    // await navigateTo('/profile')

  } catch (error) {
    console.error('Erreur de connexion :', error)
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}

/**
 * Changement de mode
 */
const switchMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMsg.value = ''
  successMsg.value = ''
}
</script>

<template>
  <div class="auth-layout">
    <header class="header">
      <RouterLink to="/">
        <img
          src="/Property 1=king.png"
          alt="Movie King Logo"
          class="logo"
        >
      </RouterLink>
    </header>

    <main class="main-content">
      <h1 class="page-title">
        {{ isLoginMode ? 'Connexion' : 'Créer un compte' }}
      </h1>

      <RegisterForm
        v-if="!isLoginMode"
        @dataFormRegister="handleRegister"
      />

      <LoginForm
        v-else
        @dataFormLogin="handleLogin"
      />

       <button
        class="switch-btn"
        @click="switchMode"
      >
        {{
          isLoginMode
            ? 'Je n’ai pas encore de compte'
            : 'J’ai déjà un compte'
        }}
      </button>

      <p
        v-if="isLoading"
        class="msg info"
      >
        Chargement en cours...
      </p>

      <p
        v-if="errorMsg"
        class="msg error"
      >
        {{ errorMsg }}
      </p>

      <p
        v-if="successMsg"
        class="msg success"
      >
        {{ successMsg }}
      </p>
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
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.switch-btn {
  width: 100%;
  max-width: 350px;
  margin-bottom: 20px;
  padding: 12px;

  background-color: #555;
  color: white;

  border: none;
  border-radius: 25px;

  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.switch-btn:hover {
  background-color: #333;
}

.msg {
  margin-top: 16px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  width: 100%;
  max-width: 400px;
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