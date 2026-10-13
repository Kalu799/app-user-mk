import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../pages/AuthPage.vue'
import GuestHome from '../pages/GuestHomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/guesthome'
    },
    {
      path: '/auth',
      name: 'auth',
      component: Auth
    },
    {
      path: '/guesthome',
      name: 'guesthome',
      component: GuestHome
    }
  ]
})

export default router