<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { getLevelProgress } from '@/utils/levelProgress'
import UserAvatar from '@/components/UserAvatar.vue'

/* Détermine si l'écran est en version mobile. */
const isMobile = ref(false)

// Met à jour le format de l'avatar selon la largeur de l'écran.
const updateAvatarSize = () => {
  isMobile.value = window.innerWidth < 600
}

// Au montage du composant, détecte la taille de l'écran
// et écoute les changements de largeur de la fenêtre.
onMounted(() => {
  updateAvatarSize()
  window.addEventListener('resize', updateAvatarSize)
})

// Supprime l'écouteur lorsque le composant est démonté
// afin d'éviter de conserver un écouteur inutile.
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateAvatarSize)
})

// Définit la taille de l'avatar selon le format de l'écran :
// 90 px sur mobile et 104 px sur tablette et desktop.
const avatarSize = computed(() => (isMobile.value ? 90 : 104))

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
      <div class="user-avatar-background">
        <UserAvatar :user="user" :size="avatarSize" />
      </div>

      <button
        v-if="showAvatarEdit"
        type="button"
        class="avatar-edit-button"
        aria-label="Modifier mon avatar"
        title="Modifier mon avatar"
        @click="$emit('edit-avatar')"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m16 4 4 4" />
          <path d="M4 20l4.5-1 11-11a2.12 2.12 0 0 0-3-3l-11 11L4 20z" />
        </svg>
      </button>
    </div>

    <div class="user-info">
      <!-- Affiche le pseudo transmis par la home. -->
      <h2 class="user-pseudo">{{ pseudo }}</h2>

      <!-- Affiche le niveau et la progression calculés depuis le score total. -->
      <div class="user-level">
        <p class="level-label">Niveau {{ levelProgress.level }}</p>

        <progress
          class="xp-bar"
          :value="levelProgress.xpInLevel"
          :max="levelProgress.xpForNextLevel"
          :aria-label="`Progression vers le niveau ${levelProgress.level + 1}`"
        >
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
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Inter:wght@400;600;700&display=swap');

/* Carte principale */
.user-summary {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
  gap: 20px;

  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  padding: 14px;

  background-color: #64a69d;
  color: #173c37;
  border: 3px solid #111;
  border-radius: 8px;
  box-shadow: 4px 4px 0 #111;

  font-family: 'Inter', sans-serif;
}

/* Avatar et fond circulaire */
.user-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  width: 84px;
  min-width: 0;
  min-height: 0;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  background: transparent;
}

.user-avatar-background {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 84px;
  height: calc(100% - 12px);
  min-height: 84px;
  box-sizing: border-box;

  background-color: #f5efe3;
  border-radius: 8px;
}

/* Bouton d'édition superposé */
.avatar-edit-button {
  position: absolute;
  left: -6px;
  bottom: -4px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  padding: 0;

  border: 2px solid #fff;
  border-radius: 50%;
  background-color: #ff626b;
  color: #fff;
  box-shadow: 0 2px 5px rgb(0 0 0 / 18%);

  cursor: pointer;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
}

.avatar-edit-button svg {
  width: 17px;
  height: 17px;
}

.avatar-edit-button:hover {
  transform: scale(1.08);
  background-color: #ed4f59;
}

.avatar-edit-button:focus-visible {
  outline: 3px solid #222;
  outline-offset: 3px;
}

/* Informations du joueur */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.user-info h2,
.user-info p {
  margin: 0;
}

.user-pseudo {
  color: #111;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(1.25rem, 5vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

/* Niveau et progression XP */
.user-level {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.level-label {
  color: #111;
  font-weight: 800;
}

.xp-bar {
  box-sizing: border-box;
  display: block;
  appearance: none;
  width: 100%;
  height: 15px;
  overflow: hidden;

  border: 2px solid #111;
  border-radius: 999px;
  background-color: #f5efe3;
}

.xp-bar::-webkit-progress-bar {
  background-color: #f5efe3;
}

.xp-bar::-webkit-progress-value {
  background-color: #ffb900;
}

.xp-bar::-moz-progress-bar {
  background-color: #ffb900;
}

.xp-details {
  color: #173c37;
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Titre et classement */
.user-title,
.user-position {
  padding: 6px 9px;
  border-radius: 8px;
  background-color: #f5efe3;
  color: #173c37;
  font-size: 0.8rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

/* Tablettes et desktop */
@media (min-width: 600px) {
  .user-summary {
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 20px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 5px 5px 0 #111;
  }

  .user-avatar-wrapper {
    width: 112px;
  }

  .user-avatar-background {
    width: 112px;
    height: calc(100% - 16px);
    min-height: 112px;
  }

  .avatar-edit-button {
    left: -4px;
    bottom: -4px;
    width: 38px;
    height: 38px;
  }

  .avatar-edit-button svg {
    width: 21px;
    height: 21px;
  }

  .user-info {
    gap: 8px;
  }

  .user-title,
  .user-position {
    padding: 7px 10px;
    font-size: 0.85rem;
  }

  .xp-details {
    font-size: 0.8rem;
  }
}

/* Très petits écrans */
@media (max-width: 360px) {
  .user-summary {
    grid-template-columns: 68px minmax(0, 1fr);
    gap: 10px;
    padding: 10px;
  }

  .user-avatar-wrapper {
    width: 68px;
  }

  .user-avatar-background {
    width: 68px;
    height: calc(100% - 12px);
    min-height: 0;
    border-radius: 6px;
  }

  .avatar-edit-button {
    width: 28px;
    height: 28px;
  }

  .avatar-edit-button svg {
    width: 15px;
    height: 15px;
  }

  .user-info {
    gap: 6px;
  }

  .user-pseudo {
    font-size: 1.2rem;
  }

  .user-title,
  .user-position {
    padding: 5px 7px;
    font-size: 0.72rem;
  }
}
</style>
