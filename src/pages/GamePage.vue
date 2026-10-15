<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()
const currentTime = ref(performance.now())

const remainingSeconds = computed(() => {
  if (!gameStore.game || gameStore.questionStartedAt === null) {
    return 0
  }

  const elapsedMs = Math.max(
    0,
    currentTime.value - gameStore.questionStartedAt,
  )

  const remainingMs = gameStore.game.question_time_limit_ms - elapsedMs

  return Math.max(0, Math.ceil(remainingMs / 1000))
})

let clockInterval = null

onMounted(() => {
  clockInterval = setInterval(() => {
    currentTime.value = performance.now()
  }, 100)
})

onUnmounted(() => {
  clearInterval(clockInterval)
})
</script>

<template>
  <main>
    <h1>Partie de quiz</h1>

    <button @click="gameStore.loadGame(5)">Charger la partie Action</button>

    <p v-if="gameStore.game">
      {{ gameStore.game.genre.genre_name }} : {{ gameStore.game.questions.length }} questions
    </p>
    <section v-if="gameStore.currentQuestion">
      <h2>Question {{ gameStore.currentQuestionIndex + 1 }}</h2>
      <p>Temps restant : {{ remainingSeconds }} s</p>

      <blockquote>
        {{ gameStore.currentQuestion.quote.quote_text }}
      </blockquote>
      <ul>
        <li v-for="movie in gameStore.currentQuestion.options" :key="movie.ID_movie">
          <button
            type="button"
            @click="gameStore.selectMovie(movie.ID_movie)"
            :class="{ selected: gameStore.selectedMovieId === movie.ID_movie }"
            :aria-pressed="gameStore.selectedMovieId === movie.ID_movie"
          >
            {{ movie.movie_title }}
          </button>
        </li>
      </ul>
      <button
  type="button"
  :disabled="gameStore.selectedMovieId === null"
>
  Valider
</button>
    </section>
  </main>
</template>
<style scoped>
.selected {
  background-color: #ffdd66;
  color: #111;
  outline: 3px solid #111;
}
</style>
