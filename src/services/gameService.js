import actionGame from '../data/game-start-action.json'
import horrorGame from '../data/game-start-horreur.json'
// Charge les bonnes réponses des deux parties de test.
import correctionData from '../data/game-corrections.local.json'

export async function startGame({ ID_genre }) {
  if (ID_genre === 5) {
    return structuredClone(actionGame)
  }

  if (ID_genre === 6) {
    return structuredClone(horrorGame)
  }

  throw new Error('Catégorie inconnue')
}

export function isAnswerCorrect(answer, correctMovieId, timeLimitMs) {
  // Compare l'identifiant choisi à celui du film attendu.
  const isRightMovie = answer.selected_movie_id === correctMovieId

  // Une réponse doit être validée avant la limite.
  // Un temps négatif ne représente pas une réponse valide.
  const isOnTime = answer.response_time_ms >= 0 && answer.response_time_ms < timeLimitMs

  // La réponse est correcte uniquement si les deux conditions sont vraies.
  return isRightMovie && isOnTime
}

export function getGameCorrection(gameId) {
  // Cherche le corrigé dont l'identifiant correspond à la partie jouée.
  const correction = correctionData.games.find((game) => {
    return game.game_id === gameId
  })

  // Signale une erreur si aucun corrigé ne correspond.
  if (!correction) {
    throw new Error('Corrigé introuvable pour cette partie')
  }

  // Renvoie une copie pour préserver les données du fichier de référence.
  return structuredClone(correction)
}
export async function finishGame(gameId, { answers }) {
  // Récupère le corrigé de la partie demandée.
  const correction = getGameCorrection(gameId)

  // Retrouve les paramètres de cette partie, notamment sa durée.
  const game = [actionGame, horrorGame].find((game) => {
    return game.game_id === gameId
  })

  if (!game) {
    throw new Error('Partie introuvable')
  }

  // La correction doit recevoir toutes les réponses de la partie.
  if (!Array.isArray(answers) || answers.length !== game.question_count) {
    throw new Error('Le nombre de réponses est incorrect')
  }

  // Construit un résultat de correction pour chaque question.
  const corrections = correction.questions.map((question) => {
    // Retrouve la réponse du joueur grâce à l'identifiant de la question.
    const answer = answers.find((answer) => {
      return answer.question_id === question.question_id
    })

    // Chaque question doit avoir une réponse, même après une expiration.
    if (!answer) {
      throw new Error(`Réponse manquante pour ${question.question_id}`)
    }
    // Retrouve la question jouée pour accéder à sa citation et à ses films.
    const playedQuestion = game.questions.find((gameQuestion) => {
      return gameQuestion.question_id === question.question_id
    })

    // Signale une incohérence entre la partie et son corrigé.
    if (!playedQuestion) {
      throw new Error('Question introuvable dans la partie')
    }

    // Cherche le film sélectionné parmi les quatre propositions.
    // Si aucune réponse n'a été validée, aucun film ne correspond à null.
    const selectedMovie = playedQuestion.options.find((movie) => {
      return movie.ID_movie === answer.selected_movie_id
    })

    // Retrouve le titre du bon film grâce à son identifiant.
    const correctMovie = playedQuestion.options.find((movie) => {
      return movie.ID_movie === question.correct_movie_id
    })

    // Le bon film et tout film choisi doivent appartenir aux propositions.
    if (!correctMovie || (answer.selected_movie_id !== null && !selectedMovie)) {
      throw new Error('Film absent des propositions de cette question')
    }
    return {
      // Recopie la question, le film choisi et le temps enregistré.
      ...answer,

      // Fournit la citation à afficher dans la carte de correction.
      quote_text: playedQuestion.quote.quote_text,

      // Fournit le titre choisi, ou null si aucune réponse n'a été validée.
      selected_movie_title: selectedMovie?.movie_title ?? null,

      // Fournit toujours le titre du bon film.
      correct_movie_title: correctMovie.movie_title,

      // Ajoute le bon film et le résultat de notre vérification.
      correct_movie_id: question.correct_movie_id,
      is_correct: isAnswerCorrect(answer, question.correct_movie_id, game.question_time_limit_ms),
    }
  })

  // Garde uniquement les corrections dont is_correct vaut true,
  // puis compte combien il en reste.
  const correctAnswersCount = corrections.filter((correction) => {
    return correction.is_correct
  }).length

  // Renvoie le récapitulatif et les corrections détaillées.
  return {
    game_id: gameId,
    summary: {
      correct_answers: correctAnswersCount,
      question_count: corrections.length,
    },
    corrections,
  }
}
