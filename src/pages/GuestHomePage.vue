<script setup>

import { RouterLink } from 'vue-router'

</script>

<template>

  <div>
    <h1>GuestPage</h1>

    <nav>
      <RouterLink to="/">Home</RouterLink>
      |
      <RouterLink to="/auth">Créer un compte / se connecter</RouterLink>
    </nav>

  </div>

</template>

<style scoped></style>