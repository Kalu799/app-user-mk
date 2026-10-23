// Reprend l’adresse de l’API configurée dans le .env.
const API_URL = import.meta.env.VITE_API_BASE_URL

export const getCurrentUser = async (token) => {
  // Demande le profil associé au token de connexion.
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Transforme la réponse JSON en objet JavaScript.
  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)

    // Permet à la page de reconnaître une connexion expirée.
    error.status = response.status
    throw error
  }

  // Renvoie le profil, notamment son identifiant ID_user.
  return data
}

export const getMyHats = async (token) => {
  const response = await fetch(`${API_URL}/user/me/hats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(
      data.statusMessage || data.message || `Erreur HTTP ${response.status}`,
    )

    error.status = response.status
    throw error
  }

  return data.hats
}

export const updateMyAvatar = async (token, avatarData) => {
  const response = await fetch(`${API_URL}/user/me/avatar`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(avatarData),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(
      data.statusMessage || data.message || `Erreur HTTP ${response.status}`,
    )

    error.status = response.status
    throw error
  }

  return data
}
