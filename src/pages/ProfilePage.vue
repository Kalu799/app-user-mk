<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { RouterLink, useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const TOKEN_KEY = 'movie-king-auth-token'
const gameStore = useGameStore()
const router = useRouter()
const user = ref(null)
const errorMsg = ref('')

onMounted(async () => {
  const token = window.sessionStorage.getItem(TOKEN_KEY)

  if (!token) {
    gameStore.$reset()
    await router.replace('/auth')
    return
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

  <header class="header">
    <nav class="nav">
      <RouterLink to="/homepage"><img src="/Property 1=king.png" alt="Movie King Logo" class="logo" /></RouterLink>
      <button type="button" @click="logout">Déconnexion</button>
    </nav>
  </header>

  <main>
    <h1>ici c'est le profile</h1>
  </main>

  <!-- Affiche la navigation sur cette page. -->
  <BottomNav />

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