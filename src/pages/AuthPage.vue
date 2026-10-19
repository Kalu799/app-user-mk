<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import RegisterForm from '@/components/RegisterForm.vue'
import LoginForm from '@/components/LoginForm.vue'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_BASE_URL
console.log('API_URL utilisée :', API_URL)
const TOKEN_KEY = 'movie-king-auth-token'

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
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
    }

    successMsg.value = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
    isLoginMode.value = true
  } catch (error) {
    errorMsg.value = error.message || "Erreur lors de la création du compte"
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
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
    }
    if (!data.token || !data.user) {
      throw new Error('Réponse invalide du serveur d’authentification')
    }

    window.sessionStorage.setItem(TOKEN_KEY, data.token)
    await router.push('/homepage')
  } catch (error) {
    errorMsg.value = error.message || 'Erreur lors de la connexion'
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
        <img src="/Property 1=king.png" alt="Movie King Logo" class="logo">
      </RouterLink>
    </header>

    <main class="main-content">
      <h1 class="page-title">
        {{ isLoginMode ? 'Connexion' : 'Créer un compte' }}
      </h1>

      <RegisterForm v-if="!isLoginMode" @dataFormRegister="handleRegister" />

      <LoginForm v-else @dataFormLogin="handleLogin" />

      <button class="switch-btn" @click="switchMode">
        {{
          isLoginMode
            ? 'Je n’ai pas encore de compte'
            : 'J’ai déjà un compte'
        }}
      </button>

      <p v-if="isLoading" class="msg info">
        Chargement en cours...
      </p>

      <p v-if="errorMsg" class="msg error">
        {{ errorMsg }}
      </p>

      <p v-if="successMsg" class="msg success">
        {{ successMsg }}
      </p>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700;800&display=swap');

:where(*, *::before, *::after) {
  box-sizing: border-box;
}

.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  background-color: #1c1c1c;
  color: #f5efe3;
  font-family: 'Inter', sans-serif;
}

/* HEADER — mêmes dimensions que la GuestHome */

.header {
  width: 100%;
  padding: .5rem 1rem;

  display: flex;
  align-items: center;

  background-color: #f5efe3;
}

.header a {
  display: inline-flex;
  align-items: center;
}

.logo {
  display: block;
  height: 60px;
  object-fit: contain;
}

/* CONTENU */

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;
  padding: 45px 20px 60px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* TITRE — reprend le traitement du hero */

.page-title {
  width: 100%;
  max-width: 460px;
  margin: 0 0 10px;
  padding: 30px 20px;

  background-color: #64a69d;
  border-bottom: 6px solid #e9dfca;

  color: #fff5df;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(2.8rem, 8vw, 3.8rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  text-align: center;
  text-shadow: 3px 4px 0 #344b43;
}

/* CHANGEMENT CONNEXION / INSCRIPTION */

.switch-btn {
  width: 100%;
  max-width: 400px;
  min-height: 55px;
  margin: 10px 0 5px;
  padding: 12px 20px;

  background-color: #e9dfca;
  color: #1c1c1c;

  border: 3px solid #111;
  border-radius: 2px;
  box-shadow: 5px 5px 0 #000;

  font-family: 'Inter', sans-serif;
  font-size: .95rem;
  font-weight: 700;
  line-height: 1.4;

  cursor: pointer;
  transition:
    background-color .2s,
    transform .15s,
    box-shadow .15s;
}

.switch-btn:hover {
  background-color: #fff5df;
  transform: translate(3px, 3px);
  box-shadow: 2px 2px 0 #000;
}

.switch-btn:active {
  transform: translate(5px, 5px);
  box-shadow: none;
}

.switch-btn:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 6px;
}

/* MESSAGES */

.msg {
  width: 100%;
  max-width: 400px;
  margin: 0;
  padding: 18px 15px;

  border-left: 5px solid;
  border-radius: 2px;

  font-size: .95rem;
  font-weight: 500;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.info {
  background-color: #2b2b2b;
  border-color: #64a69d;
  color: #f5efe3;
}

.error {
  background-color: #2b2b2b;
  border-color: #ff626b;
  color: #ffe0e4;
}

.success {
  background-color: #64a69d;
  border-color: #e9dfca;
  color: #173c37;
}

/* TABLETTE ET DESKTOP */

@media (min-width: 768px) {
  .main-content {
    padding: 60px 50px 80px;
    gap: 25px;
  }

  .page-title {
    padding: 40px 25px;
    margin-bottom: 15px;
  }
}

/* ACCESSIBILITÉ */

@media (prefers-reduced-motion: reduce) {
  .switch-btn {
    transition: none;
  }
}
</style>