<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import UserSummary from '@/components/UserSummary.vue'
import UsersLeaderboard from '@/components/UsersLeaderboard.vue'

const API_URL = import.meta.env.VITE_API_BASE_URL
//console.log('API_URL utilisée :', API_URL)
const TOKEN_KEY = 'movie-king-auth-token'
const router = useRouter()
const user = ref(null)
const errorMsg = ref('')
const isLoading = ref(true)

onMounted(async () => {
  const token = window.sessionStorage.getItem(TOKEN_KEY)
  if (!token) {
    await router.replace('/auth')
    return
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()

    if (response.status === 401) {
      window.sessionStorage.removeItem(TOKEN_KEY)
      await router.replace('/auth')
      return
    }
    if (!response.ok) {
      throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
    }

    user.value = data
  } catch (error) {
    errorMsg.value = error.message || 'Impossible de charger le profil'
  } finally {
    isLoading.value = false
  }
})

const logout = async () => {
  errorMsg.value = ''
  window.sessionStorage.removeItem(TOKEN_KEY)
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

      <!-- classement générale -->
      <UsersLeaderboard />

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