export const getLevelProgress = (score) => {
  // Accepte aussi un score transmis sous forme de texte par l’API.
  const numericScore = Number(score)

  // Utilise zéro si le score n’est pas un entier positif ou nul.
  const totalXp =
    Number.isSafeInteger(numericScore) && numericScore >= 0
      ? numericScore
      : 0

  let level = 1
  let xpInLevel = totalXp
  let xpForNextLevel = 1000

  // Franchit chaque niveau tant que le joueur possède assez d’XP.
  while (xpInLevel >= xpForNextLevel) {
    xpInLevel -= xpForNextLevel
    level += 1

    // Chaque passage demande 500 XP de plus que le précédent.
    xpForNextLevel += 500
  }

  return {
    level,
    totalXp,
    xpInLevel,
    xpForNextLevel,
    progressPercent: (xpInLevel / xpForNextLevel) * 100,
  }
}