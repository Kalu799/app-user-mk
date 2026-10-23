import { defineStore } from 'pinia'
import { startGame, finishGame } from '../services/gameService'
// Reste indépendant des remises à zéro du store.
let startRequestSequence = 0

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null,
    gameParameters: null,
    result: null,
    currentQuestionIndex: 0,
    selectedMovieId: null,
    questionStartedAt: null,
    answers: [],
    startRequestId: null,
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
    async loadGame(configuration = null) {
      if (this.isStarting) {
        return
      }

      const requestId = ++startRequestSequence
      this.startRequestId = requestId
      this.isStarting = true
      this.startError = null

      try {
        // Les anciens appels avec null restent des parties toutes catégories.
        const mode = configuration?.mode ?? 'find_movie'
        const genreIds = configuration?.genreIds ?? null

        if (mode !== 'find_movie') {
          throw new Error('Ce mode de jeu n’est pas encore disponible')
        }

        // Une sélection vide ne doit pas devenir une partie toutes catégories.
        if (genreIds !== null && (!Array.isArray(genreIds) || genreIds.length === 0)) {
          throw new Error('Choisis au moins un genre')
        }

        // Copie la sélection pour conserver les paramètres de cette demande.
        const parameters = {
          mode,
          genreIds: genreIds === null ? null : [...genreIds],
        }

        // L’API utilise actuellement le seul mode disponible.
        const game = await startGame({ genreIds: parameters.genreIds })

        // Ignore une réponse après une remise à zéro ou une nouvelle demande.
        if (this.startRequestId !== requestId) {
          return
        }

        this.game = game
        this.gameParameters = parameters
        this.answers = []
        this.result = null
        this.isFinishing = false
        this.finishError = null
        this.currentQuestionIndex = 0
        this.selectedMovieId = null
        this.questionStartedAt = null
      } catch (error) {
        if (this.startRequestId === requestId) {
          this.startError = error.message || 'Impossible de démarrer la partie'
        }
      } finally {
        if (this.startRequestId === requestId) {
          this.isStarting = false
          this.startRequestId = null
        }
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
