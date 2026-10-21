const API_URL = import.meta.env.VITE_API_BASE_URL

export const getCategories = async () => {
  // Demande les catégories disponibles à l’API.
  const response = await fetch(`${API_URL}/category`)
  const data = await response.json()

  // Transmet une éventuelle erreur à la page.
  if (!response.ok) {
    throw new Error(
      data?.statusMessage ||
      data?.message ||
      'Impossible de charger les catégories',
    )
  }

  // Vérifie que la réponse contient bien une liste.
  if (!Array.isArray(data?.categories)) {
    throw new Error('Réponse des catégories invalide')
  }

  return data.categories
}