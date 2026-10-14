<script>
import { RouterLink } from 'vue-router'
</script>
<template>
    <div class="homepage">
        <header class="header">
      <nav class="nav">
        <RouterLink to="/"><img src="/Property 1=king.png" alt="Movie King Logo" class="logo" /></RouterLink>
        <RouterLink to="/">logout</RouterLink>
      </nav>
    </header>
    <main>
        <h1>Bonjour ...</h1>
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
}</style>