<script setup>
import { computed } from 'vue'
import { getLevelProgress } from '@/utils/levelProgress'
import UserAvatar from '@/components/UserAvatar.vue'

const props = defineProps({
  pseudo: {
    type: String,
    required: true,
  },

  position: {
    type: Number,
    default: null,
  },

  // Reçoit le score total du compte, utilisé comme XP cumulée.
  score: {
    type: [Number, String],
    required: true,
  },

  user: {
    type: Object,
    default: () => ({}),
  },

  showAvatarEdit: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit-avatar'])

// Recalcule le niveau et la progression lorsque le score change.
const levelProgress = computed(() => getLevelProgress(props.score))
</script>

<template>
  <section class="user-summary" aria-label="Résumé de ton compte">
    <!-- Réserve la place du futur avatar. 
    <div class="user-avatar" role="img" aria-label="Avatar à venir">Avatar</div> -->
    <div class="user-avatar-wrapper">
      <UserAvatar :user="user" :size="80" />

      <button v-if="showAvatarEdit" type="button" class="avatar-edit-button" aria-label="Modifier mon avatar"
        title="Modifier mon avatar" @click="$emit('edit-avatar')">
        ✎
      </button>
    </div>

    <div class="user-info">
      <!-- Affiche le pseudo transmis par la home. -->
      <h2 class="user-pseudo">{{ pseudo }}</h2>

      <!-- Affiche le niveau et la progression calculés depuis le score total. -->
      <div class="user-level">
        <p class="level-label">Niveau {{ levelProgress.level }}</p>

        <progress class="xp-bar" :value="levelProgress.xpInLevel" :max="levelProgress.xpForNextLevel"
          :aria-label="`Progression vers le niveau ${levelProgress.level + 1}`">
          {{ Math.round(levelProgress.progressPercent) }} %
        </progress>

        <p class="xp-details">
          {{ levelProgress.xpInLevel }} / {{ levelProgress.xpForNextLevel }} XP vers le niveau
          {{ levelProgress.level + 1 }}
        </p>
      </div>

      <!-- Ce texte sera remplacé lorsque les titres seront disponibles. -->
      <p class="user-title">Titre à venir</p>

      <!-- Affiche un tiret lorsque la position n’est pas encore disponible. -->
      <p class="user-position">Position au classement : {{ position ?? '—' }}</p>
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

/* Regroupe le niveau, la barre et les informations d’XP. */
.user-level {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.level-label {
  color: #111;
  font-weight: 800;
}

/* Reprend les couleurs et les bordures de l’application. */
.xp-bar {
  box-sizing: border-box;
  display: block;
  appearance: none;
  width: 100%;
  height: 16px;
  overflow: hidden;
  background-color: #f5efe3;
  border: 2px solid #111;
  border-radius: 999px;
}

/* Fond et remplissage pour Chrome, Edge et Safari. */
.xp-bar::-webkit-progress-bar {
  background-color: #f5efe3;
}

.xp-bar::-webkit-progress-value {
  background-color: #ffb900;
}

/* Remplissage pour Firefox. */
.xp-bar::-moz-progress-bar {
  background-color: #ffb900;
}

.xp-details {
  font-size: 0.8rem;
  line-height: 1.4;
}

.user-avatar-wrapper {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.avatar-edit-button {
  position: absolute;
  left: -5px;
  bottom: -5px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #ff0000;
  color: #fff;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.avatar-edit-button:hover {
  transform: scale(1.08);
}

.avatar-edit-button:focus-visible {
  outline: 3px solid #222;
  outline-offset: 3px;
}
</style>
