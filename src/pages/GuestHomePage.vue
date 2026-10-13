<script setup>

import { RouterLink } from 'vue-router'

</script>

<template>

  <div class="guest-layout">
    <header class="header">
      <nav class="nav">
        <RouterLink to="/"><img src="/Property 1=king.png" alt="Movie King Logo" class="logo" /></RouterLink>

        <RouterLink to="/auth">Register/login</RouterLink>
      </nav>
    </header>

    <main>

    </main>

  </div>

</template>

<style scoped>
.guest-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  font-family: sans-serif;
}

.header {
  background-color: #dcdcdc;
  width: 100%;
  padding-block: 20px;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  height: 60px;
  object-fit: contain;
}
</style>