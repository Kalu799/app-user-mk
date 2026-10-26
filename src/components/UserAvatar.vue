<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  size: {
    type: Number,
    default: 80,
  },
})

// Couleurs autorisées pour le corps.
const colors = {
  blue: '#85C4FF',
  red: '#FF626B',
  yellow: '#FFCB45',
}

// Correspondances provisoires à vérifier visuellement.
const emotions = {
  happy: { body: 2, eyes: 2, mouth: 2 },
  neutral: { body: 0, eyes: 0, mouth: 0 },
  sad: { body: 3, eyes: 3, mouth: 3 },
  angry: { body: 1, eyes: 1, mouth: 1 },
  surprised: { body: 2, eyes: 0, mouth: 2 },
}

// Colonnes de la dernière ligne de la sprite sheet.
const hats = {
  blue_crown: 1,
  gold_crown: 2,
  santa_hat: 3,
}

// Décalage vertical individuel de chaque accessoire.
// Valeurs initiales à ajuster visuellement.
const hatOffsets = {
  blue_crown: '-53%',
  gold_crown: '-52%',
  santa_hat: '-49%',
}

const color = computed(() => colors[props.user?.user_avatar_color] ?? colors.blue)

const emotion = computed(() => emotions[props.user?.user_avatar_emotion] ?? emotions.neutral)

// Accepte les deux noms de champ pendant la transition backend.
const hatKey = computed(
  () => props.user?.user_avatar_hat_asset_key ?? props.user?.hat_asset_key ?? null,
)

const hatColumn = computed(() => {
  const key = hatKey.value

  if (!key || key === 'null') return null

  return hats[key] ?? null
})

const hatOffset = computed(() => {
  const key = hatKey.value

  return hatOffsets[key] ?? '-28%'
})

// Position d'une case dans une grille 4 × 4.
const positions = ['0%', '33.333333%', '66.666667%', '100%']

function spriteStyle(column, row) {
  return {
    backgroundPosition: `${positions[column]} ${positions[row]}`,
  }
}

function maskStyle(column, row) {
  return {
    maskPosition: `${positions[column]} ${positions[row]}`,
    WebkitMaskPosition: `${positions[column]} ${positions[row]}`,
  }
}

const avatarSize = computed(() =>
  Number.isFinite(props.size) && props.size > 0 ? `${props.size}px` : '80px',
)
</script>

<template>
  <div
    class="avatar"
    :style="{ width: avatarSize, height: avatarSize }"
    role="img"
    :aria-label="`Avatar ${user?.user_avatar_color ?? 'blue'}, expression ${user?.user_avatar_emotion ?? 'neutral'}`"
  >
    <!-- Corps : masque alpha recoloré -->
    <div
      class="avatar-layer avatar-body"
      :style="{
        ...maskStyle(emotion.body, 0),
        backgroundColor: color,
      }"
    ></div>

    <!-- Yeux -->
    <div class="avatar-layer avatar-eyes" :style="spriteStyle(emotion.eyes, 1)"></div>

    <!-- Bouche -->
    <div
      class="avatar-layer avatar-mouth"
      :class="{ 'avatar-mouth--sad': user?.user_avatar_emotion === 'sad' }"
      :style="spriteStyle(emotion.mouth, 2)"
    ></div>

    <!-- Chapeau indépendant -->
    <div
      v-if="hatColumn !== null"
      class="avatar-layer avatar-hat"
      :style="{
        ...spriteStyle(hatColumn, 3),
        '--hat-offset-y': hatOffset,
      }"
    ></div>
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
  display: block;
  flex-shrink: 0;
  aspect-ratio: 1;
  overflow: visible;
  isolation: isolate;
}

.avatar-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-image: url('/avatar-spritesheet.png');
  background-size: 400% 400%;
  background-repeat: no-repeat;
}

.avatar-body {
  z-index: 1;
  background-image: none;

  mask-image: url('/avatar-spritesheet.png');
  mask-size: 400% 400%;
  mask-repeat: no-repeat;
  mask-mode: alpha;

  -webkit-mask-image: url('/avatar-spritesheet.png');
  -webkit-mask-size: 400% 400%;
  -webkit-mask-repeat: no-repeat;
}

.avatar-eyes {
  z-index: 2;
}

.avatar-mouth {
  z-index: 3;
}

.avatar-hat {
  z-index: 4;
  transform: translateY(var(--hat-offset-y, -28%));
  pointer-events: none;
}

.avatar-mouth--sad {
  inset: 0;
  transform: scale(0.6) translateY(-5%);
  transform-origin: center;
}
</style>
