import { defineStore } from 'pinia'
import { startGame } from '../services/gameService'

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null,
    currentQuestionIndex: 0,
    selectedMovieId: null,
    questionStartedAt: null,
  }),
  getters: {
  currentQuestion: (state) => {
    if (!state.game) {
      return null
    }

    return state.game.questions[state.currentQuestionIndex]
  },
},
  actions: {
    async loadGame(ID_genre) {
  this.game = await startGame({ ID_genre })
  this.currentQuestionIndex = 0
  this.startQuestion()
},
    selectMovie(movieId) {
  this.selectedMovieId = movieId
},
startQuestion() {
  this.selectedMovieId = null
  this.questionStartedAt = performance.now()
},
  },
})