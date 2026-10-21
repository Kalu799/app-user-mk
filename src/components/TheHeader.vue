<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['logout'])
</script>

<template>
  <header class="header">
    <nav class="nav">
      <RouterLink :to="isAuthenticated ? '/homepage' : '/'">
        <img
          :src="isAuthenticated ? '/Property 1=king.png' : '/logo.png'"
          alt="Movie King Logo"
          class="logo"
        />
      </RouterLink>

      <div v-if="isAuthenticated" class="nav-actions">
        <button type="button" class="btn-nav" @click="$emit('logout')">Déconnexion</button>
      </div>

      <div v-else class="nav-actions">
        <RouterLink :to="{ name: 'auth', query: { mode: 'login' } }" class="btn-nav">
          Connexion
        </RouterLink>

        <RouterLink to="/auth" class="btn-nav active"> Inscription </RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header {
  background-color: #f5efe3;
  width: 100%;
  padding-block: 0.5rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-inline: 1rem;
}

.logo {
  height: 60px;
  object-fit: contain;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  background-color: #f5efe3;
  border: 2px solid #1c1c1c;
  border-radius: 8px;
  box-shadow: 2px 2px 0 #1c1c1c;
  color: #1c1c1c;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-nav:hover {
  background-color: #f4ebd0;
  border-color: #1c1c1c;
  box-shadow: 3px 3px 0 #1c1c1c;
  transform: translateY(-1px);
}

button.btn-nav {
  appearance: none;
}

@media (max-width: 767px) {
  .logo {
    height: 42px;
  }

  .nav {
    margin-inline: 0.5rem;
  }

  .nav-actions {
    gap: 15px;
  }

  .btn-nav {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}
</style>