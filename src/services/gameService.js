// Reprend l’adresse de l’API configurée dans le fichier .env.
const API_URL = import.meta.env.VITE_API_BASE_URL

// Utilise la même clé que les pages de connexion et d’accueil.
const TOKEN_KEY = 'movie-king-auth-token'

export const startGame = async ({ ID_genre = null }) => {
  // Sans catégorie précise, demande une partie toutes catégories.
  const parameters = ID_genre === null
    ? { category: 'all' }
    : { genre_ids: [ID_genre] }

  // Indique à l’API que nous envoyons du JSON.
  const headers = {
    'Content-Type': 'application/json',
  }

  // Identifie le joueur lorsqu’il possède un token de connexion.
  const token = window.sessionStorage.getItem(TOKEN_KEY)

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Demande au serveur de préparer les questions depuis la base.
  const response = await fetch(`${API_URL}/game/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify(parameters),
  })

  // Transforme la réponse JSON du serveur en objet JavaScript.
  const data = await response.json()

  // Transmet l’erreur au store, qui sait déjà l’afficher.
  if (!response.ok) {
    throw new Error(
      data.statusMessage || data.message || `Erreur HTTP ${response.status}`,
    )
  }

  // Renvoie la partie complète, y compris son game_token.
  return data
}
export const finishGame = async (gameId, { answers, gameToken }) => {
  // Indique que les réponses sont envoyées au format JSON.
  const headers = {
    'Content-Type': 'application/json',
  }

  // Identifie le compte pour une partie démarrée en étant connecté.
  const token = window.sessionStorage.getItem(TOKEN_KEY)

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Envoie la partie et les réponses au serveur pour les corriger.
  const response = await fetch(`${API_URL}/game/correction`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      game_id: gameId,

      // Permet de vérifier l’accès à une partie invitée.
      game_token: gameToken,

      // Contient les choix et les temps enregistrés par le store.
      answers,
    }),
  })

  // Récupère le résultat calculé par le serveur.
  const data = await response.json()

  // Transmet une éventuelle erreur au store.
  if (!response.ok) {
    throw new Error(
      data.statusMessage || data.message || `Erreur HTTP ${response.status}`,
    )
  }

  // Renvoie le résumé, les corrections et les points.
  return data
}