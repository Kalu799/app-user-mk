<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RegisterForm from '@/components/RegisterForm.vue'
import LoginForm from '@/components/LoginForm.vue'
import { registerUser, loginUser } from '@/services/authService'
import TheLoading from '@/components/TheLoading.vue'

const router = useRouter()
const route = useRoute()
// Indique si la page d’authentification est toujours affichée.
let isPageActive = true

onUnmounted(() => {
  isPageActive = false
})
const TOKEN_KEY = 'movie-king-auth-token'

// Ouvre la connexion si le lien la demande, sinon l’inscription.
const isLoginMode = ref(route.query.mode === 'login')

// États de feedback
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const errorMessageElement = ref(null)

// Attend que l’erreur soit affichée et le chargement terminé.
watch(
  [errorMsg, isLoading],
  ([message, loading]) => {
    if (!message || loading || !isPageActive) {
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    errorMessageElement.value?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  },
  { flush: 'post' },
)

/**
 * Inscription
 */
const handleRegister = async (userData) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await registerUser(userData)

    // Ignore le résultat si le joueur a quitté la page.
    if (!isPageActive) {
      return
    }

    successMsg.value = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
    isLoginMode.value = true
  } catch (error) {
    if (!isPageActive) {
      return
    }

    errorMsg.value = error.message || 'Erreur lors de la création du compte'
  } finally {
    isLoading.value = false
  }
}

/**
 * Connexion
 */
const handleLogin = async (loginData) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const data = await loginUser(loginData)

    // Empêche une connexion tardive après le départ de la page.
    if (!isPageActive) {
      return
    }

    if (!data?.token || !data?.user) {
      throw new Error('Réponse invalide du serveur d’authentification')
    }

    window.sessionStorage.setItem(TOKEN_KEY, data.token)
    await router.push('/homepage')
  } catch (error) {
    if (!isPageActive) {
      return
    }

    errorMsg.value = error.message || 'Erreur lors de la connexion'
  } finally {
    isLoading.value = false
  }
}

/**
 * Changement de mode
 */
const switchMode = () => {
  // Attend la fin de la demande avant de changer de formulaire.
  if (isLoading.value) {
    return
  }

  isLoginMode.value = !isLoginMode.value
  errorMsg.value = ''
  successMsg.value = ''
}
</script>

<template>
  <!-- Affiche l’attente pendant la connexion ou la création du compte. -->
  <TheLoading
    v-if="isLoading"
    fullscreen
    :label="isLoginMode ? 'Connexion en cours…' : 'Création du compte…'"
  />

  <!-- Conserve les formulaires montés et bloque les interactions pendant l’attente. -->
  <div class="auth-layout" :inert="isLoading">
    <header class="header">
      <RouterLink to="/">
        <img src="/Property 1=king.png" alt="Movie King Logo" class="logo" />
      </RouterLink>
    </header>

    <main class="main-content">
      <h1 class="page-title">
        {{ isLoginMode ? 'Connexion' : 'Créer mon compte' }}
      </h1>
      <!-- Confirme la création du compte avant le formulaire de connexion. -->
      <div v-if="successMsg" class="msg success" role="status">
        <strong>✓ Ton compte est créé !</strong>
        <p>{{ successMsg }}</p>
      </div>
      <!-- Affiche l’erreur avant les champs du formulaire. -->
      <p v-if="errorMsg" ref="errorMessageElement" class="msg error" role="alert">
        {{ errorMsg }}
      </p>
      <RegisterForm
        v-if="!isLoginMode"
        :is-loading="isLoading"
        @dataFormRegister="handleRegister"
      />

      <LoginForm v-else :is-loading="isLoading" @dataFormLogin="handleLogin" />

      <button type="button" class="switch-btn" :disabled="isLoading" @click="switchMode">
        {{ isLoginMode ? 'Je n’ai pas encore de compte' : 'J’ai déjà un compte' }}
      </button>
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
  padding: 0.5rem 1rem;

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
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.4;

  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.15s,
    box-shadow 0.15s;
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

  font-size: 0.95rem;
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

/* Met la confirmation en évidence au-dessus du formulaire. */
.success strong {
  display: block;
  font-size: 1.15rem;
}

.success p {
  margin: 8px 0 0;
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
