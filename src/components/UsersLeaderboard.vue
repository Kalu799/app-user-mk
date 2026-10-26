<script setup>
import { computed, onMounted, ref } from 'vue'
import TheLoading from '@/components/TheLoading.vue'
import UserAvatar from '@/components/UserAvatar.vue'

const props = defineProps({
  currentUserId: {
    type: [Number, String],
    default: null,
  },

  mode: {
    type: String,
    default: 'general',
    validator: (value) => ['general', 'preview', 'nearby'].includes(value),
  },
})

const API_URL = import.meta.env.VITE_API_BASE_URL

const users = ref([])
const isLoading = ref(true)
const errorMsg = ref('')

const searchPseudo = ref('')
const scoreOrder = ref('desc')

const title = computed(() => {
  const titles = {
    general: 'Classement général',
    preview: 'Top 10',
    nearby: 'Ta place dans le classement',
  }

  return titles[props.mode]
})

// Les positions suivent l’ordre renvoyé par l’API.
const rankedUsers = computed(() => {
  return users.value.map((user, index) => ({
    ...user,
    position: index + 1,
  }))
})

const currentUserIndex = computed(() => {
  if (props.currentUserId === null) {
    return -1
  }

  return rankedUsers.value.findIndex((user) => {
    return String(user.ID_user) === String(props.currentUserId)
  })
})

const filteredGeneralUsers = computed(() => {
  const search = searchPseudo.value.trim().toLocaleLowerCase('fr')

  const filteredUsers = rankedUsers.value.filter((user) => {
    return String(user.user_pseudo ?? '')
      .toLocaleLowerCase('fr')
      .includes(search)
  })

  return filteredUsers.sort((a, b) => {
    const scoreDifference = Number(a.user_score) - Number(b.user_score)

    // En cas d’égalité, conserve l’ordre initial du classement.
    if (scoreDifference === 0) {
      return a.position - b.position
    }

    return scoreOrder.value === 'asc' ? scoreDifference : -scoreDifference
  })
})

const displayedUsers = computed(() => {
  if (props.mode === 'general') {
    return filteredGeneralUsers.value
  }

  if (props.mode === 'preview') {
    return rankedUsers.value.slice(0, 10)
  }

  if (currentUserIndex.value === -1) {
    return []
  }

  // Sélectionne le top 3 et la dernière position.
  const selectedIndexes = new Set([0, 1, 2, rankedUsers.value.length - 1])

  // Ajoute le joueur et ses deux voisins de chaque côté.
  const start = Math.max(0, currentUserIndex.value - 2)
  const end = Math.min(rankedUsers.value.length - 1, currentUserIndex.value + 2)

  for (let index = start; index <= end; index++) {
    selectedIndexes.add(index)
  }

  // filter conserve l’ordre du classement et évite les doublons.
  return rankedUsers.value.filter((user, index) => {
    return selectedIndexes.has(index)
  })
})

// Ajoute une ligne de séparation lorsqu’on saute des positions.
const displayedRows = computed(() => {
  const rows = []

  displayedUsers.value.forEach((user, index) => {
    const previousUser = displayedUsers.value[index - 1]

    if (props.mode === 'nearby' && previousUser && user.position > previousUser.position + 1) {
      rows.push({
        type: 'gap',
        key: `gap-${previousUser.position}-${user.position}`,
      })
    }

    rows.push({
      type: 'user',
      key: `user-${user.ID_user}`,
      user,
    })
  })

  return rows
})

const isCurrentUser = (user) => {
  return props.currentUserId !== null && String(user.ID_user) === String(props.currentUserId)
}

const loadLeaderboard = async () => {
  isLoading.value = true
  errorMsg.value = ''

  try {
    const response = await fetch(`${API_URL}/leaderboard`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.statusMessage || data.message || 'Impossible de charger le classement')
    }

    if (!Array.isArray(data.leaderboard)) {
      throw new Error('Réponse du classement invalide')
    }

    users.value = data.leaderboard
  } catch (error) {
    errorMsg.value = error.message || 'Impossible de charger le classement'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLeaderboard)
</script>

<template>
  <section class="users-leaderboard">
    <h2>{{ title }}</h2>

    <!-- Affiche le chargement dans la zone du classement. -->
    <TheLoading v-if="isLoading" label="Chargement du classement…" />

    <div v-else-if="errorMsg" role="alert">
      <p>{{ errorMsg }}</p>

      <button type="button" @click="loadLeaderboard">Réessayer</button>
    </div>

    <p v-else-if="rankedUsers.length === 0">Aucun joueur dans le classement.</p>

    <p v-else-if="mode === 'nearby' && currentUserIndex === -1">Ta position est indisponible.</p>

    <p v-else-if="mode === 'general' && displayedUsers.length === 0">
      Aucun joueur ne correspond à « {{ searchPseudo }} ».
    </p>

    <table v-else>
      <caption v-if="mode === 'nearby'" class="leaderboard-position">
        Tu es
        <strong>{{ currentUserIndex + 1 }}{{ currentUserIndex === 0 ? 'er' : 'e' }}</strong>
        sur
        {{
          rankedUsers.length
        }}
        {{
          rankedUsers.length === 1 ? 'joueur' : 'joueurs'
        }}
      </caption>
      <thead>
        <tr>
          <th scope="col">Position</th>
          <th scope="col">Pseudo</th>
          <th scope="col">Points</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="row in displayedRows" :key="row.key">
          <tr v-if="row.type === 'gap'" class="leaderboard-gap">
            <td colspan="3">
              <span aria-hidden="true">•••</span>
              <span class="sr-only">Positions intermédiaires masquées</span>
            </td>
          </tr>

          <tr v-else :class="{ 'current-user': isCurrentUser(row.user) }">
            <td>
              <span
                class="rank-badge"
                :class="{
                  'rank-gold': row.user.position === 1,
                  'rank-silver': row.user.position === 2,
                  'rank-bronze': row.user.position === 3,
                }"
              >
                #{{ row.user.position }}
              </span>
            </td>

            <th scope="row">
              <div class="leaderboard-user">
                <UserAvatar :user="row.user" :size="40" />

                <div class="leaderboard-user-info">
                  <span class="leaderboard-user-pseudo">
                    {{ row.user.user_pseudo }}
                  </span>

                  <span v-if="isCurrentUser(row.user)" class="leaderboard-user-current">
                    — Toi
                  </span>
                </div>
              </div>
            </th>

            <td>{{ row.user.user_score }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Inter:wght@400;600;700&display=swap');

.users-leaderboard,
.users-leaderboard * {
  box-sizing: border-box;
}

/* CONTENEUR */

.users-leaderboard {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;

  color: #f5efe3;
  font-family: 'Inter', sans-serif;
}

/* TITRE — reprend les couleurs du hero */

.users-leaderboard h2 {
  margin: 0 0 25px;
  padding: 25px 20px;

  background-color: #64a69d;
  border-bottom: 6px solid #e9dfca;

  color: #fff5df;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(1.8rem, 6vw, 2.8rem);
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  text-shadow: 3px 3px 0 #344b43;
}

/* TABLEAU — espace entre les lignes pour créer des cartes */

.users-leaderboard table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0 10px;
  text-align: left;
}

/* EN-TÊTES */

.users-leaderboard thead th {
  padding: 12px 15px;

  color: #e9dfca;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

/* Largeurs réservées au rang et aux points.
   Le pseudo prend l'espace restant. */

.users-leaderboard thead th:first-child {
  width: 90px;
}

.users-leaderboard thead th:last-child {
  width: 125px;
  text-align: right;
}

/* LIGNES */

.users-leaderboard tbody td,
.users-leaderboard tbody th {
  padding: 20px 15px;

  background-color: #292929;
  border-top: 2px solid #3c3c38;
  border-bottom: 2px solid #3c3c38;

  font-size: 1rem;
  line-height: 1.4;
  transition: background-color 0.2s;
}

/* POSITION */

.users-leaderboard tbody td:first-child {
  border-left: 4px solid #e9dfca;
  border-radius: 4px 0 0 4px;

  color: #f5efe3;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
}

/* PSEUDO */

.users-leaderboard tbody th {
  color: #fff5df;
  font-weight: 700;
  overflow-wrap: anywhere;
}

/* POINTS */

.users-leaderboard tbody td:last-child {
  border-right: 2px solid #3c3c38;
  border-radius: 0 4px 4px 0;

  color: #ffb900;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: right;
  overflow-wrap: anywhere;
}

/* SURVOL */

.users-leaderboard tbody tr:hover > * {
  background-color: #343430;
}

/* JOUEUR CONNECTÉ */

.users-leaderboard tbody tr.current-user > * {
  background-color: #64a69d;
  border-top-color: #64a69d;
  border-bottom-color: #64a69d;

  color: #111;
}

.users-leaderboard tbody tr.current-user td:first-child {
  border-left-color: #ff626b;
}

.users-leaderboard tbody tr.current-user td:last-child {
  border-right-color: #64a69d;
}

/* Petit repère "Toi", déjà présent dans le template */

.users-leaderboard .current-user th span {
  display: inline-block;
  margin-left: 5px;

  font-size: 0.8rem;
  font-weight: 800;
}

/* CHARGEMENT, CLASSEMENT VIDE ET ERREURS */

.users-leaderboard > p,
.users-leaderboard > div[role='alert'] {
  margin: 20px 0 0;
  padding: 20px 15px;

  background-color: #292929;
  border-left: 5px solid #64a69d;

  color: #f5efe3;
  font-size: 0.95rem;
  line-height: 1.6;
}

.users-leaderboard > div[role='alert'] {
  border-left-color: #ff626b;
}

.users-leaderboard > div[role='alert'] p {
  margin: 0 0 15px;
}

/* BOUTON RÉESSAYER */

.users-leaderboard button {
  min-height: 44px;
  padding: 12px 20px;

  background-color: #e9dfca;
  color: #1c1c1c;

  border: 3px solid #111;
  border-radius: 2px;
  box-shadow: 4px 4px 0 #000;

  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;

  cursor: pointer;
}

.users-leaderboard button:hover {
  background-color: #fff5df;
}

.users-leaderboard button:active {
  transform: translate(4px, 4px);
  box-shadow: none;
}

.users-leaderboard button:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 5px;
}

/* MOBILE */

@media (max-width: 480px) {
  .users-leaderboard h2 {
    padding: 22px 12px;
  }

  .users-leaderboard thead th {
    padding: 10px 8px;
    font-size: 0.65rem;
  }

  .users-leaderboard thead th:first-child {
    width: 65px;
  }

  .users-leaderboard thead th:last-child {
    width: 90px;
  }

  .users-leaderboard tbody td,
  .users-leaderboard tbody th {
    padding: 16px 8px;
    font-size: 0.85rem;
  }

  .users-leaderboard tbody td:first-child {
    font-size: 1.1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .users-leaderboard tbody td,
  .users-leaderboard tbody th {
    transition: none;
  }
}

/* Séparation entre le podium et le groupe du joueur */
.users-leaderboard tbody tr.leaderboard-gap > td {
  padding: 6px 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;

  color: #e9dfca;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 6px;
  text-align: center;
}

.users-leaderboard .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.users-leaderboard .leaderboard-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.users-leaderboard .leaderboard-filters label {
  display: flex;
  flex: 1 1 220px;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.users-leaderboard .leaderboard-filters label > span {
  color: #e9dfca;
  font-size: 0.8rem;
  font-weight: 700;
}

.users-leaderboard .leaderboard-filters input,
.users-leaderboard .leaderboard-filters select {
  width: 100%;
  min-width: 0;
  min-height: 46px;
  padding: 12px;

  background-color: #292929;
  color: #fff5df;

  border: 2px solid #64a69d;
  border-radius: 4px;

  font: inherit;
  font-size: 0.9rem;
  color-scheme: dark;
}

.users-leaderboard .leaderboard-filters input::placeholder {
  color: #bcb7ab;
}

.users-leaderboard .leaderboard-filters select {
  cursor: pointer;
}

.users-leaderboard .leaderboard-filters input:focus-visible,
.users-leaderboard .leaderboard-filters select:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 3px;
}

/* MOBILE : marges autour du composant */
.users-leaderboard {
  width: calc(100% - 32px);
  max-width: 760px;
  margin: 24px auto 36px;
}

.users-leaderboard h2 {
  margin-bottom: 24px;
  padding: 24px 16px;
  font-size: clamp(1.8rem, 7vw, 2.8rem);
}

/* FILTRES : empilés sur mobile */
.users-leaderboard .leaderboard-filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  margin: 0 0 24px;
  padding: 20px 16px;

  background-color: #292929;
  border: 2px solid #3c3c38;
  border-top: 4px solid #64a69d;
  border-radius: 6px;
}

.users-leaderboard .leaderboard-filters label {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.users-leaderboard .leaderboard-filters label > span {
  color: #fff5df;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
}

.users-leaderboard .leaderboard-filters input,
.users-leaderboard .leaderboard-filters select {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 50px;
  padding: 12px;

  background-color: #191919;
  color: #fff5df;

  border: 2px solid #64a69d;
  border-radius: 4px;

  font: inherit;
  font-size: 1rem;
  line-height: 1.5;
  color-scheme: dark;
}

.users-leaderboard .leaderboard-filters input::placeholder {
  color: #c9c5bd;
  opacity: 1;
}

.users-leaderboard .leaderboard-filters select {
  cursor: pointer;
}

.users-leaderboard .leaderboard-filters input:focus-visible,
.users-leaderboard .leaderboard-filters select:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 3px;
}

/* CLASSEMENT */
.users-leaderboard table {
  margin: 0;
  border-spacing: 0 10px;
}

/* En-têtes foncés pour rester lisibles sur le fond blanc */
.users-leaderboard thead th {
  padding: 12px 10px;
  color: #344b43;

  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.users-leaderboard thead th:first-child {
  width: 80px;
}

.users-leaderboard thead th:last-child {
  width: 90px;
}

.users-leaderboard tbody td,
.users-leaderboard tbody th {
  padding: 18px 10px;
  font-size: 1rem;
  line-height: 1.5;
}

.users-leaderboard tbody td:first-child {
  font-size: 1.2rem;
}

.users-leaderboard tbody th {
  color: #fff5df;
}

.users-leaderboard tbody td:last-child {
  color: #ffcb45;
  font-size: 1.05rem;
}

/* Garde les textes du joueur connecté bien contrastés */
.users-leaderboard tbody tr.current-user > * {
  color: #111;
}

/* Points de séparation visibles sur le fond blanc */
.users-leaderboard tbody tr.leaderboard-gap > td {
  color: #344b43;
}

/* ÉCRANS PLUS LARGES */
@media (min-width: 640px) {
  .users-leaderboard {
    width: calc(100% - 48px);
    margin-block: 32px 48px;
  }

  .users-leaderboard .leaderboard-filters {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    align-items: end;
    gap: 24px;
    padding: 24px;
  }

  .users-leaderboard thead th {
    padding-inline: 16px;
    font-size: 0.9rem;
  }

  .users-leaderboard thead th:first-child {
    width: 105px;
  }

  .users-leaderboard thead th:last-child {
    width: 125px;
  }

  .users-leaderboard tbody td,
  .users-leaderboard tbody th {
    padding: 22px 16px;
    font-size: 1.05rem;
  }
}

.users-leaderboard {
  padding-bottom: calc(80px + 24px + env(safe-area-inset-bottom, 0px));
}

.leaderboard-user {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.leaderboard-user-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.leaderboard-user-pseudo {
  overflow-wrap: anywhere;
}

.leaderboard-user-current {
  font-size: 0.8rem;
  font-weight: 800;
}

@media (max-width: 480px) {
  .leaderboard-user {
    gap: 8px;
  }
}

/* Repères de position et couleurs du podium. */
.users-leaderboard .leaderboard-position {
  caption-side: top;
  padding: 12px;
  background-color: #292929;
  color: #f5efe3;
  font-size: 1rem;
  text-align: center;
}

.users-leaderboard .rank-badge {
  display: inline-block;
  border-radius: 4px;
}

.users-leaderboard .rank-gold,
.users-leaderboard .rank-silver,
.users-leaderboard .rank-bronze {
  padding: 4px 8px;
  color: #111;
}

.users-leaderboard .rank-gold {
  background-color: #e4bc50;
}
.users-leaderboard .rank-silver {
  background-color: #c4cbd3;
}
.users-leaderboard .rank-bronze {
  background-color: #cd9c6b;
}

.users-leaderboard .last-place-label {
  display: block;
  margin-top: 4px;
  color: inherit;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
