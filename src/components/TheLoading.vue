<script setup>
defineProps({
  // Active l’affichage par-dessus toute la page.
  fullscreen: {
    type: Boolean,
    default: false,
  },
  // Permet de préciser ce qui est en cours de chargement.
  label: {
    type: String,
    default: 'Chargement en cours…',
  },
})
</script>
<template>
  <div
    class="loader-grid"
    :class="{ 'is-fullscreen': fullscreen }"
    role="status"
  >
    <!-- Les éléments animés sont décoratifs ; le texte décrit l’attente. -->
    <img src="/smile.svg" alt="" class="mascotte" />

    <div class="dots-container" aria-hidden="true">
      <div class="jump-wrapper">
        <span class="dot"></span>
      </div>
      <div class="jump-wrapper">
        <span class="dot"></span>
      </div>
      <div class="jump-wrapper">
        <span class="dot"></span>
      </div>
    </div>

    <p class="loading-label">{{ label }}</p>
  </div>
</template>

<style scoped>
/* Par défaut, le chargement occupe une zone dans la page. */
.loader-grid {
  box-sizing: border-box;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 24px;
  width: 100%;
  min-height: 240px;
  padding: 32px 16px;
  background-color: #1c1c1c;
  color: #f5efe3;
}

/* Le mode plein écran recouvre la page pendant l’opération. */
.loader-grid.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow-y: auto;
}

.loading-label {
  margin: 0;
  font-family: 'Inter', sans-serif;
  text-align: center;
  line-height: 1.5;
}

/* -- Les 3 boules -- */

.dots-container {
  display: flex;
  gap: 20px;
}

.jump-wrapper {
  display: inline-block;
  animation: pure-jump 2s infinite;
}

.dot {
  width: 1.5rem;
  height: 1.5rem;
  background-color: #ffffff;
  border-radius: 50%;
  display: block;
  transform-origin: bottom center;
  animation: pure-squash 2s infinite;
}

/* Synchronisation de la vague */
.dots-container div:nth-child(2),
.dots-container div:nth-child(2) .dot {
  animation-delay: 0.4s;
}

.dots-container div:nth-child(3),
.dots-container div:nth-child(3) .dot {
  animation-delay: 0.8s;
}

/* ===================================================
    1. LE SAUT (Avec courbes de transition intégrées)
    =================================================== */
@keyframes pure-jump {

  0%,
  15% {
    transform: translateY(0);
    /* Force une transition ultra-dynamique vers le haut au décollage */
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  }

  45% {
    transform: translateY(-28px);
    /* Force une transition lourde et accélérée pour simuler la chute libre vers le sol */
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }

  70%,
  100% {
    transform: translateY(0);
  }
}

/* ===================================================
   2. LA DÉFORMATION (Avec effet ressort/amorti)
   =================================================== */
@keyframes pure-squash {

  0%,
  15% {
    transform: scale(1, 1);
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  }

  45% {
    transform: scale(0.85, 1.25);
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }

  /* 1. L'IMPACT EXTENSIVEMENT SOUPLÉ (à 70%) */
  70% {
    transform: scale(1.3, 0.65);
    /* Elle s'écrase au sol */
    /* On applique une courbe très douce pour la phase de stabilisation */
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  }

  /* 🌟 2. LE REBOND DE SÉCURITÉ (à 76%) : Le secret de la fluidité */
  76% {
    transform: scale(0.95, 1.05);
    /* Elle dépasse un tout petit peu sa taille (légèrement étirée) */
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  }

  /* 3. RETOUR À LA NORMALE EN DOUCEUR (à 82%) */
  82% {
    transform: scale(1.02, 0.98);
    /* Une mini vibration finale presque invisible */
    animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  }

  /* 4. LA PAUSE IMMOBILE ET PARFAITE */
  88%,
  100% {
    transform: scale(1, 1);
    /* Elle ne bouge plus du tout, l'arrêt est enfin invisible */
  }
}

/* -- la mascotte -- */

.mascotte {
  /* 🌟 On applique une animation de balancement fluide de 4 secondes (deux fois plus lente que les boules) */
  animation: mascotte-wave 4s infinite ease-in-out;

  /* On place le point d'ancrage en bas au centre pour qu'elle pivote depuis sa base */
  transform-origin: bottom center;
  width: 100px;
  height: auto;
}
/* Agrandit la mascotte pour les chargements en plein écran. */
.is-fullscreen .mascotte {
  width: 160px;
}
/* ===================================================
   3. ANIMATION DE LA MASCOTTE (Balancement continu)
   =================================================== */
@keyframes mascotte-wave {

  0%,
  100% {
    transform: rotate(0deg) scale(1, 1);
  }

  25% {
    transform: rotate(-3deg) scale(1.02, 0.98);
    /* Penche légèrement à gauche et s'écrase un mini poil */
  }

  50% {
    transform: rotate(0deg) scale(1, 1);
  }

  75% {
    transform: rotate(3deg) scale(1.02, 0.98);
    /* Penche légèrement à droite */
  }
}
</style>