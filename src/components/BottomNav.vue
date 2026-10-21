<template>
  <!-- Regroupe les trois accès de la navigation principale. -->
  <nav class="bottom-nav" aria-label="Navigation principale">
    <!-- Ouvrira la page du classement lorsqu’elle sera disponible. -->
    <button type="button" class="nav-item">
      <router-link to="/leaderboard">Classement</router-link>
    </button>

    <!-- Le bouton central aura un style plus visible. -->
    <button type="button" class="nav-item nav-item-play">
      Créer une partie
    </button>

    <!-- Ouvrira le profil de l’utilisateur connecté. -->
    <button type="button" class="nav-item">
      Profil
    </button>
  </nav>
</template>
<style scoped>
/* Inclut les bordures et les espacements dans la largeur des éléments. */
.bottom-nav,
.nav-item {
  box-sizing: border-box;
}

/* Garde la navigation visible en bas de l’écran. */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;

  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  align-items: center;
  gap: 10px;

  /* Préserve un espace au-dessus de la zone système de certains mobiles. */
  padding: 12px 12px calc(16px + env(safe-area-inset-bottom, 0px));

  background-color: #f5efe3;
  border-top: 3px solid #111;
}

/* Reprend les couleurs, bordures et ombres des boutons existants. */
.nav-item {
  min-width: 0;
  min-height: 56px;
  padding: 10px 6px;

  background-color: #e9dfca;
  color: #1c1c1c;
  border: 2px solid #111;
  border-radius: 5px;
  box-shadow: 3px 3px 0 #111;

  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.3;
  cursor: pointer;
}

/* Met en évidence l’accès à la création de partie. */
.nav-item-play {
  background-color: #ffb900;
  font-weight: 800;
}

/* Rend le bouton ciblé au clavier facilement repérable. */
.nav-item:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 4px;
}
</style>