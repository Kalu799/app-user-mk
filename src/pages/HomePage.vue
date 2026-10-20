<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

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
    <main>
      <p v-if="isLoading">Chargement...</p>
      <p v-if="errorMsg" role="alert">{{ errorMsg }}</p>
      <h1 v-if="user">Bonjour {{ user.user_pseudo }}</h1>
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

/* Réserve de la place pour la navigation fixée au-dessus du contenu. */
.homepage {
  box-sizing: border-box;
  min-height: 100dvh;
  padding-bottom: calc(110px + env(safe-area-inset-bottom, 0px));
}
</style>