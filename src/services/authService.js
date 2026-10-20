const API_URL = import.meta.env.VITE_API_BASE_URL

// Regroupe l’envoi des demandes d’authentification.
const sendAuthRequest = async (action, payload) => {
  const response = await fetch(`${API_URL}/auth/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(
      data?.statusMessage || data?.message || `Erreur HTTP ${response.status}`,
    )

    error.status = response.status
    throw error
  }

  return data
}

// Crée un compte.
export const registerUser = (userData) => {
  return sendAuthRequest('register', userData)
}

// Demande une connexion.
export const loginUser = (loginData) => {
  return sendAuthRequest('login', loginData)
}