import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '../stores/game'
import Auth from '../pages/AuthPage.vue'
import GuestHome from '../pages/GuestHomePage.vue'
import HomePage from '../pages/HomePage.vue'
import GamePage from '../pages/GamePage.vue'
import GameResultPage from '../pages/GameResultPage.vue'
import LeaderboardPage from '../pages/LeaderboardPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/guesthome',
    },
    {
      path: '/auth',
      name: 'auth',
      component: Auth,
    },
    {
      path: '/guesthome',
      name: 'guesthome',
      component: GuestHome,
    },
    {
      path: '/homepage',
      name: 'homepage',
      component: HomePage,
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardPage,
    },
    {
      path: '/game',
      name: 'game',
      component: GamePage,

      // Ce contrôle s'exécute avant d'entrer sur la page de jeu.
      beforeEnter: () => {
        // Récupère le store au moment de la navigation.
        const gameStore = useGameStore()

        // Sans partie prête, renvoie vers l'accueil invité.
        if (!gameStore.game || gameStore.isStarting) {
          return { name: 'guesthome' }
        }

        // Autorise l'accès lorsque les données sont disponibles.
        return true
      },
    },
    {
  path: '/game-result',
  name: 'game-result',
  component: GameResultPage,

  // Évite d’afficher une page vide si aucun résultat n’est disponible.
  beforeEnter: () => {
    const gameStore = useGameStore()

    if (!gameStore.result) {
      return { name: 'guesthome' }
    }

    return true
  },
},
  ],
})

export default router
