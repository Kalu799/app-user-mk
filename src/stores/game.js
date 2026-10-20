import { defineStore } from 'pinia'
import { startGame, finishGame } from '../services/gameService'

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null,
    gameParameters: null,
    result: null,
    currentQuestionIndex: 0,
    selectedMovieId: null,
    questionStartedAt: null,
    answers: [],
    isStarting: false,
    startError: null,
    isFinishing: false,
    finishError: null,
  }),
  getters: {
    currentQuestion: (state) => {
      if (!state.game) {
        return null
      }

      // Si l'index dépasse la dernière question, renvoie null.
      return state.game.questions[state.currentQuestionIndex] ?? null
    },
  },
  actions: {
    beginGame() {
      // Attend une question disponible et la fin du chargement.
      // Évite aussi de redémarrer un chrono déjà lancé.
      if (!this.currentQuestion || this.isStarting || this.questionStartedAt !== null) {
        return
      }

      // Démarre la première question lorsque la page est prête.
      this.startQuestion()
    },
    async loadGame(ID_genre) {
      // Ignore une nouvelle demande si le démarrage est déjà en cours.
      if (this.isStarting) {
        return
      }

      // Commence l'attente et efface une éventuelle erreur précédente.
      this.isStarting = true
      this.startError = null

      try {
        // Attend les données du service avant de préparer la partie.
        this.game = await startGame({ ID_genre })
        this.gameParameters = {
  // null correspond à une partie toutes catégories.
  ID_genre: ID_genre ?? null,
}

        // Réinitialise les données de la partie précédente.
        this.answers = []
        this.result = null
        this.isFinishing = false
        this.finishError = null
        this.currentQuestionIndex = 0

        // Prépare la partie sans démarrer le chrono.
        // La page le démarrera lorsque la première question sera affichée.
        this.selectedMovieId = null
        this.questionStartedAt = null
      } catch (error) {
        // Conserve l'erreur pour que la page puisse l'afficher.
        this.startError = error.message
      } finally {
        // Termine l'attente, que le démarrage ait réussi ou échoué.
        this.isStarting = false
      }
    },
    selectMovie(movieId) {
      this.selectedMovieId = movieId
    },
    startQuestion() {
      this.selectedMovieId = null
      this.questionStartedAt = performance.now()
    },
    nextQuestion() {
      // Avance d'une position dans le tableau des questions.
      this.currentQuestionIndex += 1

      // Si une question existe encore, prépare sa sélection et son chrono.
      if (this.currentQuestion) {
        this.startQuestion()
        return
      }

      // Après la dernière question, efface la sélection et arrête la mesure.
      this.selectedMovieId = null
      this.questionStartedAt = null
      this.completeGame()
    },
    validateAnswer() {
      const question = this.currentQuestion

      // Il faut une question dont la mesure du temps a commencé.
      // L'absence de sélection sera vérifiée après le calcul du temps.
      if (!question || this.questionStartedAt === null) {
        return
      }

      // Empêche d'enregistrer deux fois la même question.
      const alreadyAnswered = this.answers.some((answer) => {
        return answer.question_id === question.question_id
      })

      if (alreadyAnswered) {
        return
      }

      // Mesure le temps au moment exact du clic.
      const elapsedMs = Math.max(0, performance.now() - this.questionStartedAt)

      const timeLimitMs = this.game.question_time_limit_ms

      // À partir de la limite, la sélection ne compte plus.
      const isTooLate = elapsedMs >= timeLimitMs
      // Avant la limite, le joueur doit avoir choisi un film pour valider.
      // Après la limite, nous devons enregistrer l'expiration, même sans choix.
      if (!isTooLate && this.selectedMovieId === null) {
        return
      }

      // Ajoute une réponse à la liste, sans calculer sa correction.
      this.answers.push({
        question_id: question.question_id,
        selected_movie_id: isTooLate ? null : this.selectedMovieId,

        // Conserve un nombre entier de millisecondes, limité à 30 000.
        response_time_ms: Math.min(timeLimitMs, Math.floor(elapsedMs)),
      })
      // La réponse est enregistrée : nous pouvons passer à la suivante.
      this.nextQuestion()
    },
    checkTimeout() {
      // Ne fait rien avant le démarrage ou après la dernière question.
      if (!this.currentQuestion || this.questionStartedAt === null) {
        return
      }

      // Mesure le temps réellement écoulé pour la question courante.
      const elapsedMs = performance.now() - this.questionStartedAt

      // Lorsque le délai est atteint, enregistre une réponse expirée.
      if (elapsedMs >= this.game.question_time_limit_ms) {
        this.validateAnswer()
      }
    },
    async completeGame() {
      // Évite de demander plusieurs fois une correction déjà en cours ou reçue.
      if (this.isFinishing || this.result) {
        return
      }

      // Garde la référence de la partie que nous allons corriger.
      const game = this.game

      this.isFinishing = true
      this.finishError = null

      try {
        // Vérifie que toutes les réponses sont présentes.
        if (!game || this.answers.length !== game.question_count) {
          throw new Error('La partie doit être terminée avant sa correction')
        }

        // Transmet les réponses et le jeton reçu au démarrage de cette partie.
const result = await finishGame(game.game_id, {
  answers: this.answers,
  gameToken: game.game_token,
})

        // Conserve le résultat uniquement si cette partie est toujours courante.
        if (this.game === game) {
          this.result = result
        }
      } catch (error) {
        // Rend l'erreur accessible sans effacer les réponses du joueur.
        if (this.game === game) {
          this.finishError = error.message
        }
      } finally {
        // Termine l'attente, que la correction ait réussi ou échoué.
        if (this.game === game) {
          this.isFinishing = false
        }
      }
    },
  },
})
