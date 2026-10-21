<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import UserSummary from '@/components/UserSummary.vue'
import UsersLeaderboard from '@/components/UsersLeaderboard.vue'
import { useGameStore } from '@/stores/game'
import { getCurrentUser } from '@/services/userService'
import TheLoading from '@/components/TheLoading.vue'

const TOKEN_KEY = 'movie-king-auth-token'
const router = useRouter()
const gameStore = useGameStore()
const user = ref(null)
const errorMsg = ref('')
const isLoading = ref(true)
// Évite une navigation tardive après le départ de la homepage.
let isPageActive = true

onUnmounted(() => {
  isPageActive = false
})

onMounted(async () => {
  const token = window.sessionStorage.getItem(TOKEN_KEY)

  if (!token) {
    gameStore.$reset()
    await router.replace('/auth')
    return
  }

  try {
    // Le service effectue la requête et vérifie la réponse.
    const profile = await getCurrentUser(token)

    // Ignore la réponse si la connexion a changé entre-temps.
    if (window.sessionStorage.getItem(TOKEN_KEY) !== token) {
      return
    }

    user.value = profile
  } catch (error) {
    // Une ancienne requête ne doit pas affecter une nouvelle connexion.
    if (window.sessionStorage.getItem(TOKEN_KEY) !== token) {
      return
    }

    if (error.status === 401) {
      window.sessionStorage.removeItem(TOKEN_KEY)
      user.value = null
      gameStore.$reset()
      await router.replace('/auth')
      return
    }

    errorMsg.value = error.message || 'Impossible de charger le profil'
  } finally {
    isLoading.value = false
  }
})

// Accès provisoire au jeu en attendant la création de partie.
const launchGame = async () => {
  // Attend le profil et empêche les lancements simultanés.
  if (!user.value || gameStore.isStarting) {
    return
  }

  const token = window.sessionStorage.getItem(TOKEN_KEY)

  // Une partie depuis cette page nécessite une connexion.
  if (!token) {
    user.value = null
    gameStore.$reset()
    await router.replace('/auth')
    return
  }

  // Le service transmet le token pour une partie toutes catégories.
  await gameStore.loadGame(null)

  // Ignore la navigation si la page ou la connexion a changé.
  if (
    !isPageActive ||
    window.sessionStorage.getItem(TOKEN_KEY) !== token
  ) {
    return
  }

  // Ouvre uniquement une partie prête, sans erreur de lancement.
  if (
    gameStore.startError ||
    !gameStore.game ||
    gameStore.isStarting
  ) {
    return
  }

  await router.push({ name: 'game' })
}

const logout = async () => {
  errorMsg.value = ''

  // Retire la connexion et les informations affichées du compte.
  window.sessionStorage.removeItem(TOKEN_KEY)
  user.value = null

  // Efface la partie, les réponses et les résultats précédents.
  gameStore.$reset()

  await router.push('/guesthome')
}
</script>
<template>
  <!-- Recouvre la page pendant la préparation de la partie. -->
  <TheLoading
    v-if="gameStore.isStarting"
    fullscreen
    label="Préparation de la partie…"
  />

  <!-- Empêche les interactions derrière le chargement plein écran. -->
  <div class="homepage" :inert="gameStore.isStarting">
    <header class="header">
      <nav class="nav">
        <RouterLink to="/homepage"><img src="/Property 1=king.png" alt="Movie King Logo" class="logo" /></RouterLink>
        <button type="button" @click="logout">Déconnexion</button>
      </nav>
    </header>
    <main class="home-content">
<!-- Chargement limité à la zone du profil. -->
<TheLoading v-if="isLoading" label="Chargement du profil…" />      <p v-if="errorMsg" role="alert">{{ errorMsg }}</p>

      <!-- Transmet le pseudo récupéré par la home au composant. -->
      <UserSummary v-if="user" :pseudo="user.user_pseudo" />

            <!-- Accès provisoire, à retirer lorsque la création de partie sera prête. -->
      <section v-if="user" class="quick-play" aria-label="Lancer une partie">
        <button
          type="button"
          class="play-button"
          :disabled="gameStore.isStarting"
          @click="launchGame"
        >
          {{ gameStore.isStarting ? 'Chargement…' : 'Jouer (Temporaire)' }}
        </button>

        <!-- Affiche l’erreur et permet de réessayer avec le même bouton. -->
        <p v-if="gameStore.startError" class="play-error" role="alert">
          {{ gameStore.startError }}
        </p>
      </section>

      <!-- classement autour du user connecté -->
      <UsersLeaderboard v-if="user" :current-user-id="user.ID_user" mode="nearby" />
    </main>
    <!-- Affiche la navigation sur cette page. -->
    <BottomNav />
  </div>
</template>
<style scoped>
/* HEADER */

.header {
  background-color: #dcdcdc;
  width: 100%;
  padding-block: 1rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-inline: 2rem;
}

.logo {
  height: 60px;
  object-fit: contain;
}

button {
  cursor: pointer;
}

/* Organise la page verticalement et réserve la place de la navigation. */
.homepage {
  box-sizing: border-box;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(110px + env(safe-area-inset-bottom, 0px));
}

/* Utilise l’espace disponible et centre verticalement la bannière. */
.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 32px 20px;
}

/* Bouton provisoire reprenant les couleurs de l’application. */
.quick-play {
  width: 100%;
  max-width: 400px;
  align-self: center;
}

.play-button {
  width: 100%;
  min-height: 55px;
  padding: 12px 20px;
  background-color: #ffb900;
  color: #1c1c1c;
  border: 3px solid #111;
  border-radius: 5px;
  box-shadow: 4px 4px 0 #111;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.play-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.play-button:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 5px;
}

.play-error {
  margin: 12px 0 0;
  color: #a52030;
}
</style>