<script setup>
// Les props permettent à la home de transmettre des données au composant.
defineProps({
  // Le pseudo sera celui récupéré pour l’utilisateur connecté.
  pseudo: {
    type: String,
    required: true,
  },

  // La position restera vide tant que le classement n’est pas récupéré.
  position: {
    type: Number,
    default: null,
  },
})
</script>

<template>
  <section class="user-summary" aria-label="Résumé de ton compte">
    <!-- Réserve la place du futur avatar. -->
    <div
      class="user-avatar"
      role="img"
      aria-label="Avatar à venir"
    >
      Avatar
    </div>

    <div class="user-info">
      <!-- Affiche le pseudo transmis par la home. -->
      <h2 class="user-pseudo">{{ pseudo }}</h2>

      <!-- Ce texte sera remplacé lorsque les titres seront disponibles. -->
      <p class="user-title">Titre à venir</p>

      <!-- Affiche un tiret lorsque la position n’est pas encore disponible. -->
      <p class="user-position">
        Position au classement : {{ position ?? '—' }}
      </p>
    </div>
  </section>
</template>
<style scoped>
/* Reprend les typographies déjà utilisées dans l’application. */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Inter:wght@400;600;700&display=swap');

/* Place l’avatar à gauche et les informations à droite. */
.user-summary {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: clamp(72px, 22vw, 110px) minmax(0, 1fr);
  align-items: center;
  gap: 16px;

  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  padding: 20px;

  background-color: #64a69d;
  color: #173c37;
  border: 3px solid #111;
  border-radius: 8px;
  box-shadow: 5px 5px 0 #111;

  font-family: 'Inter', sans-serif;
}

/* Réserve un emplacement circulaire pour le futur avatar. */
.user-avatar {
  aspect-ratio: 1;
  display: grid;
  place-items: center;

  background-color: #f5efe3;
  border: 2px solid #111;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
}

/* Empile les informations et autorise les textes longs à revenir à la ligne. */
.user-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-wrap: anywhere;
}

/* Retire les marges automatiques des titres et paragraphes. */
.user-info h2,
.user-info p {
  margin: 0;
}

/* Donne davantage d’importance au pseudo. */
.user-pseudo {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(1.1rem, 5vw, 1.5rem);
  line-height: 1.2;
}

/* Présente le titre et la position sur des fonds crème. */
.user-title,
.user-position {
  padding: 6px 10px;
  background-color: #f5efe3;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.4;
}
/* Met le pseudo en évidence avec un texte plus grand, épais et contrasté. */
.user-pseudo {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(1.4rem, 6vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  color: #111;
}
</style>