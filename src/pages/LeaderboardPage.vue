<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'
import { getCurrentUser } from '@/services/userService'
import BottomNav from '@/components/BottomNav.vue'
import UsersLeaderboard from '@/components/UsersLeaderboard.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheLoading from '@/components/TheLoading.vue'

const TOKEN_KEY = 'movie-king-auth-token'
const gameStore = useGameStore()
const router = useRouter()
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
  <TheHeader :is-authenticated="true" @logout="logout" />

  <TheLoading v-if="isLoading === true" fullscreen label="Chargement du classement..." />

  <!-- Classement complet -->
  <UsersLeaderboard v-else-if="user" mode="general" :current-user-id="user.ID_user" />

  <!-- Affiche la navigation sur cette page. -->
  <BottomNav />
</template>
