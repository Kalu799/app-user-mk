<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const API_URL = '/api/auth'
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
    const response = await fetch(`${API_URL}/me`, {
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

    user.value = data.user
  } catch (error) {
    errorMsg.value = error.message || 'Impossible de charger le profil'
  } finally {
    isLoading.value = false
  }
})

const logout = async () => {
  errorMsg.value = ''
  const token = window.sessionStorage.getItem(TOKEN_KEY)

  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
    }

    window.sessionStorage.removeItem(TOKEN_KEY)
    await router.push('/guesthome')
  } catch (error) {
    errorMsg.value = error.message || 'Impossible de se déconnecter'
  }
}
</script>
<template>
    <div class="homepage">
        <header class="header">
      <nav class="nav">
        <RouterLink to="/"><img src="/Property 1=king.png" alt="Movie King Logo" class="logo" /></RouterLink>
        <button type="button" @click="logout">Déconnexion</button>
      </nav>
    </header>
    <main>
        <p v-if="isLoading">Chargement...</p>
        <p v-if="errorMsg" role="alert">{{ errorMsg }}</p>
        <h1 v-if="user">Bonjour {{ user.pseudo }}</h1>
    </main>
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
</style>