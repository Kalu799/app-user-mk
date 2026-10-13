import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../pages/Auth.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth'
    },
    {
      path: '/auth',
      name: 'auth',
      component: Auth
    }
  ]
})

export default router