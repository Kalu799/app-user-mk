import actionGame from '../data/game-start-action.json'
import horrorGame from '../data/game-start-horreur.json'

export async function startGame({ ID_genre }) {
  if (ID_genre === 5) {
    return structuredClone(actionGame)
  }

  if (ID_genre === 6) {
    return structuredClone(horrorGame)
  }

  throw new Error('Catégorie inconnue')
}