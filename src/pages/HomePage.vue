<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import UserSummary from '@/components/UserSummary.vue'
import UsersLeaderboard from '@/components/UsersLeaderboard.vue'
import { useGameStore } from '@/stores/game'
import { getCurrentUser } from '@/services/userService'

const TOKEN_KEY = 'movie-king-auth-token'
const router = useRouter()
const gameStore = useGameStore()
const user = ref(null)
const errorMsg = ref('')
const isLoading = ref(true)

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
  <div class="homepage">
    <header class="header">
      <nav class="nav">
        <RouterLink to="/homepage"><img src="/Property 1=king.png" alt="Movie King Logo" class="logo" /></RouterLink>
        <button type="button" @click="logout">Déconnexion</button>
      </nav>
    </header>
    <main class="home-content">
      <p v-if="isLoading">Chargement...</p>
      <p v-if="errorMsg" role="alert">{{ errorMsg }}</p>

      <!-- Transmet le pseudo récupéré par la home au composant. -->
      <UserSummary v-if="user" :pseudo="user.user_pseudo" />


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
</style>