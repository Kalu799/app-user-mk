<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'

// Le store conserve la partie ; le routeur permet de quitter cet écran.
const router = useRouter()
const gameStore = useGameStore()
const currentTime = ref(performance.now())

// Transforme l'index du tableau (0, 1, 2...) en numéro lisible (1, 2, 3...).
const questionNumber = computed(() => gameStore.currentQuestionIndex + 1)

// Démarre la partie après la disparition du chargement et le rendu de Vue.
watch(
  () => gameStore.isStarting,
  (isStarting) => {
    if (!isStarting) {
      gameStore.beginGame()
    }
  },
  { flush: 'post' },
)

// Observe l’arrivée du résultat renvoyé par l’API.
watch(
  () => gameStore.result,
  (result) => {
    // Ouvre le récapitulatif uniquement après réception du résultat.
    if (result) {
      router.replace({ name: 'game-result' })
    }
  },
  // Couvre aussi une arrivée sur le jeu avec un résultat déjà disponible.
  { immediate: true },
)

// Conserve une mesure précise en millisecondes pour le bouton-timer.
const remainingTimeMs = computed(() => {
  if (!gameStore.game || gameStore.questionStartedAt === null) {
    return 0
  }

  const elapsedMs = Math.max(0, currentTime.value - gameStore.questionStartedAt)
  return Math.max(0, gameStore.game.question_time_limit_ms - elapsedMs)
})

// L'affichage numérique utilise des secondes arrondies au-dessus.
const remainingSeconds = computed(() => Math.ceil(remainingTimeMs.value / 1000))

// Le fond du bouton utilise une proportion : 1 = plein, 0.5 = moitié, 0 = vide.
// On garde ici les millisecondes pour éviter des sauts d'une seconde.
const remainingTimeRatio = computed(() => {
  const timeLimitMs = gameStore.game?.question_time_limit_ms

  if (!timeLimitMs) {
    return 0
  }

  return Math.min(1, Math.max(0, remainingTimeMs.value / timeLimitMs))
})

let clockInterval = null

onMounted(() => {
  // Couvre le lancement depuis la guest page, où la partie est déjà chargée.
  gameStore.beginGame()

  clockInterval = setInterval(() => {
    // Actualise l'affichage sans changer le moment de départ de la question.
    currentTime.value = performance.now()

    // Le store reste responsable de l'expiration et du passage à la suivante.
    gameStore.checkTimeout()
  }, 100)
})

onUnmounted(() => {
  // Évite de conserver un minuteur lorsque la page n'est plus affichée.
  clearInterval(clockInterval)
})

const goBack = () => {
  // Une partie en cours nécessite une confirmation avant d'être abandonnée.
  if (gameStore.currentQuestion) {
    const shouldLeave = window.confirm('Quitter la partie ? Ta progression sera perdue.')

    if (!shouldLeave) {
      return
    }

    gameStore.$reset()
  }

  // Destination actuelle : le choix selon la connexion sera ajouté avec l'API.
  router.push({ name: 'homepage' })
}
</script>

<template>
  <div class="game-layout">
    <!-- L'en-tête reprend l'ordre du wireframe : retour, contexte, logo. -->
    <header class="game-header">
      <div class="game-header-inner">
        <button
          type="button"
          class="back-button"
          aria-label="Revenir à l'accueil"
          @click="goBack"
        >
          <span aria-hidden="true">←</span>
        </button>

        <div v-if="gameStore.game" class="game-context">
          <!-- La V1 possède uniquement le mode find_movie. -->
          <span class="context-badge">Trouver le film</span>
          <span class="context-badge category-badge">
            {{ gameStore.game.genre.genre_name }}
          </span>
        </div>

        <!-- Réutilise le logo qui est déjà présent dans le dossier public. -->
        <img src="/Property 1=king.png" alt="Movie King" class="game-logo" />
      </div>
    </header>

    <main class="game-main">
      <!-- Ce titre reste accessible aux lecteurs d'écran sans occuper de place. -->
      <h1 class="sr-only">Partie de quiz Movie King</h1>

      <p v-if="gameStore.startError" class="game-message error-message" role="alert">
        {{ gameStore.startError }}
      </p>

      <div v-if="gameStore.currentQuestion" class="game-round">
        <section class="game-progress" aria-label="Avancement dans la partie">
          <p class="question-counter" aria-live="polite" aria-atomic="true">
            <span>Question</span>
            <strong>
              {{ questionNumber }} <span>/ {{ gameStore.game.question_count }}</span>
            </strong>
          </p>

          <!-- Un segment est coloré si son numéro a été atteint. -->
          <div
            class="progress-track"
            role="progressbar"
            aria-label="Question en cours"
            :aria-valuemin="1"
            :aria-valuemax="gameStore.game.question_count"
            :aria-valuenow="questionNumber"
            :aria-valuetext="`Question ${questionNumber} sur ${gameStore.game.question_count}`"
          >
            <span
              v-for="step in gameStore.game.question_count"
              :key="step"
              class="progress-segment"
              :class="{ 'is-reached': step <= questionNumber }"
              aria-hidden="true"
            ></span>
          </div>
        </section>

        <section class="question-panel" aria-labelledby="question-title">
          <h2 id="question-title" class="question-title">
            De quel film provient cette réplique ?
          </h2>

          <blockquote class="quote-card">
            <p>« {{ gameStore.currentQuestion.quote.quote_text }} »</p>
          </blockquote>

          <!-- Les quatre propositions utilisent les mêmes actions qu'avant. -->
          <ul class="answer-grid" aria-label="Films proposés">
            <li v-for="movie in gameStore.currentQuestion.options" :key="movie.ID_movie">
              <button
                type="button"
                class="answer-button"
                :class="{ 'is-selected': gameStore.selectedMovieId === movie.ID_movie }"
                :aria-pressed="gameStore.selectedMovieId === movie.ID_movie"
                @click="gameStore.selectMovie(movie.ID_movie)"
              >
                {{ movie.movie_title }}
              </button>
            </li>
          </ul>

          <div class="validation-area">
            <!-- La variable CSS transmet la proportion de temps restant au fond. -->
            <button
              type="button"
              class="validate-button"
              :style="{ '--time-ratio': remainingTimeRatio }"
              :disabled="gameStore.selectedMovieId === null"
              @click="gameStore.validateAnswer()"
            >
              <!-- Une nouvelle question recrée le fond directement plein. -->
              <span
                :key="gameStore.currentQuestion.question_id"
                class="validation-fill"
                aria-hidden="true"
              ></span>
              <span class="validation-label">Valider</span>
              <span class="validation-time">{{ remainingSeconds }} s</span>
            </button>
          </div>
        </section>
      </div>

      <!-- Indique que le serveur est en train de corriger la partie. -->
<p v-if="gameStore.isFinishing" class="game-message" role="status">
  Calcul du résultat en cours…
</p>

<!-- Rend visible une éventuelle erreur de correction. -->
<p
  v-else-if="gameStore.finishError"
  class="game-message error-message"
  role="alert"
>
  {{ gameStore.finishError }}
</p>

<!-- Confirme la réception du résultat avant le futur écran récapitulatif. -->
<p v-else-if="gameStore.result" class="game-message" role="status">
  Partie terminée : résultat reçu !
</p>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700;800&display=swap');

/* Inclut les bordures et les espacements dans les dimensions des éléments. */
:where(*, *::before, *::after) {
  box-sizing: border-box;
}

/* Ces couleurs reprennent la guest page et la page d'authentification. */
.game-layout {
  --page-bg: #1c1c1c;
  --surface-bg: #2b2b2b;
  --cream: #f5efe3;
  --paper: #e9dfca;
  --ink: #111;
  --yellow: #ffb900;
  --coral: #ff626b;
  --green: #64a69d;

  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background-color: var(--page-bg);
  color: var(--cream);
  font-family: 'Inter', sans-serif;
}

button {
  font: inherit;
}

button:not(:disabled) {
  cursor: pointer;
}

/* Le focus reste visible pour les personnes qui jouent avec le clavier. */
button:focus-visible {
  outline: 3px solid var(--coral);
  outline-offset: 5px;
}

/* EN-TÊTE : les trois colonnes gardent le contexte entre le retour et le logo. */
.game-header {
  background-color: var(--cream);
  color: var(--ink);
  border-bottom: 3px solid var(--ink);
}

.game-header-inner {
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;
  padding: 10px 16px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 52px;
  align-items: center;
  gap: 10px;
}

.back-button {
  width: 44px;
  height: 44px;
  padding: 0;
  display: grid;
  place-items: center;
  background-color: var(--ink);
  color: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 50%;
  font-size: 28px;
  line-height: 1;
}

.back-button:hover {
  background-color: var(--surface-bg);
}

.game-context {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.context-badge {
  padding: 6px 9px;
  background-color: #e5dfd4;
  border: 1px solid #d1c9bc;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
}

.category-badge {
  background-color: var(--green);
  border-color: var(--green);
  color: #173c37;
}

.game-logo {
  display: block;
  width: 52px;
  height: 52px;
  object-fit: contain;
}

/* CONTENU : une largeur limitée rend les citations et les réponses lisibles. */
.game-main {
  flex: 1;
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}

.game-round {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* PROGRESSION : le nombre et les segments représentent la question courante. */
.game-progress {
  width: 90%;
  margin-inline: auto;
}

.question-counter {
  margin: 0 0 10px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
}

.question-counter > span {
  color: #c4bdaf;
}

.question-counter strong {
  font-size: 18px;
  font-weight: 800;
}

.question-counter strong span {
  color: #bcb5a7;
  font-size: 14px;
  font-weight: 500;
}

.progress-track {
  height: 18px;
  padding: 3px;
  display: flex;
  gap: 3px;
  overflow: hidden;
  background-color: var(--ink);
  border-radius: 999px;
}

.progress-segment {
  flex: 1;
  min-width: 0;
  background-color: #49473f;
}

.progress-segment:first-child {
  border-radius: 999px 0 0 999px;
}

.progress-segment:last-child {
  border-radius: 0 999px 999px 0;
}

.progress-segment.is-reached {
  background-color: var(--yellow);
}

/* QUESTION : la consigne reprend le bandeau sombre et l'accent corail du site. */
.question-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.question-title {
  margin: 0;
  padding: 18px 16px;
  background-color: var(--surface-bg);
  border-left: 5px solid var(--coral);
  border-radius: 2px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(1.15rem, 3.8vw, 1.65rem);
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
}

.quote-card {
  min-height: clamp(132px, 20svh, 200px);
  margin: 0;
  padding: 24px 20px;
  display: grid;
  place-items: center;
  background-color: var(--green);
  color: #173c37;
  border: 3px solid var(--ink);
  border-radius: 14px;
  box-shadow: 5px 5px 0 var(--ink);
}

.quote-card p {
  margin: 0;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(1.35rem, 5vw, 2rem);
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  overflow-wrap: anywhere;
}

/* RÉPONSES : deux colonnes, même si les titres occupent plusieurs lignes. */
.answer-grid {
  margin: 0;
  padding: 0 4px 4px 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  list-style: none;
}

.answer-grid li {
  min-width: 0;
}

.answer-button {
  width: 100%;
  height: 100%;
  min-height: 88px;
  padding: 16px 12px;
  background-color: var(--paper);
  color: var(--page-bg);
  border: 3px solid transparent;
  border-radius: 8px;
  box-shadow: 4px 4px 0 var(--ink);
  font-size: clamp(0.88rem, 2.8vw, 1rem);
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
  transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.answer-button:hover {
  background-color: #fff5df;
}

/* Cette couleur signifie « sélectionné », sans révéler la correction. */
.answer-button.is-selected {
  background-color: #fff5df;
  border-color: var(--yellow);
  box-shadow: 4px 4px 0 var(--yellow);
}

/* VALIDATION : reste en bas du contenu sans recouvrir les réponses. */
.validation-area {
  margin-top: auto;
  padding-top: 6px;
}

.validate-button {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 62px;
  padding: 16px 70px;
  overflow: hidden;
  background-color: var(--paper);
  color: var(--ink);
  border: 3px solid var(--ink);
  border-radius: 8px;
  box-shadow: 5px 5px 0 var(--ink);
  font-weight: 800;
  font-size: 1rem;
  line-height: 1.4;
  text-transform: uppercase;
}

/* Le fond restant est ancré à droite : la zone vide avance de gauche à droite. */
.validation-fill {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: var(--yellow);
  transform: scaleX(var(--time-ratio, 1));
  transform-origin: right center;
  transition: transform 100ms linear;
  pointer-events: none;
}

.validation-label {
  position: relative;
}

.validation-time {
  position: absolute;
  top: 50%;
  right: 14px;
  padding: 4px 7px;
  transform: translateY(-50%);
  background-color: rgb(17 17 17 / 8%);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  text-transform: none;
}

/* Le timer reste visible et continue même lorsque Valider est désactivé. */
.validate-button:disabled {
  cursor: not-allowed;
  opacity: 0.78;
}

.validate-button:not(:disabled):hover {
  border-color: var(--yellow);
}

/* MESSAGES : garde le retour d'erreur et le message de fin provisoire. */
.game-message {
  margin: 0;
  padding: 20px;
  background-color: var(--surface-bg);
  border-left: 5px solid var(--green);
  line-height: 1.6;
}

.error-message {
  border-color: var(--coral);
  color: #ffe0e4;
}

/* Cache uniquement visuellement le titre destiné aux lecteurs d'écran. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* Sur tablette et ordinateur, aère les éléments sans étirer toute la page. */
@media (min-width: 768px) {
  .game-header-inner {
    padding: 12px 32px;
  }

  .context-badge {
    padding: 8px 14px;
    font-size: 13px;
  }

  .game-context {
    gap: 10px;
  }

  .game-main {
    padding: 30px 24px 34px;
  }

  .game-round {
    gap: 26px;
  }

  .question-panel {
    gap: 22px;
  }

  .answer-button {
    min-height: 96px;
    padding: 20px 18px;
  }
}

/* Sur petit mobile, conserve les deux colonnes avec des espacements adaptés. */
@media (max-width: 359px) {
  .game-header-inner {
    padding-inline: 12px;
    gap: 6px;
  }

  .context-badge {
    padding-inline: 7px;
    font-size: 10px;
  }

  .game-main {
    padding: 20px 14px;
  }

  .game-round,
  .question-panel {
    gap: 16px;
  }

  .answer-grid {
    gap: 12px;
  }

  .answer-button {
    padding: 12px 9px;
    font-size: 0.85rem;
  }
}

/* Respecte la préférence des personnes qui réduisent les animations. */
@media (prefers-reduced-motion: reduce) {
  .answer-button,
  .validation-fill {
    transition: none;
  }
}
</style>
