<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import UsersLeaderboard from '@/components/UsersLeaderboard.vue'
import TheHeader from '@/components/TheHeader.vue'

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
  <TheHeader :is-authenticated="true" @logout="logout" />

  <!-- Classement complet -->
  <UsersLeaderboard mode="general" />

  <!-- Affiche la navigation sur cette page. -->
  <BottomNav />
</template>