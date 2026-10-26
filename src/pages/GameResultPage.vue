<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { getCurrentUser } from '@/services/userService'
import UsersLeaderboard from '@/components/UsersLeaderboard.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheLoading from '@/components/TheLoading.vue'

const TOKEN_KEY = 'movie-king-auth-token'
const gameStore = useGameStore()
const router = useRouter()
// Mémorise si la page de résultats est toujours affichée.
let isPageActive = true

onUnmounted(() => {
  isPageActive = false
})

// Choisit l’aperçu invité selon la présence d’un token.
const authToken = window.sessionStorage.getItem(TOKEN_KEY)
const isGuest = ref(!authToken)

// Les corrections sont fermées au départ.
const showCorrections = ref(false)

// Ouvre ou referme les corrections.
const toggleCorrections = () => {
  showCorrections.value = !showCorrections.value
}

// Bloque les clics répétés et conserve une éventuelle erreur.
const isReplaying = ref(false)
const replayError = ref('')

const replayGame = async () => {
  if (isReplaying.value || gameStore.isStarting) {
    return
  }

  replayError.value = ''

  // Récupère les paramètres mémorisés au démarrage précédent.
  const parameters = gameStore.gameParameters

  if (!parameters) {
    replayError.value = 'Les paramètres de cette partie sont indisponibles.'
    return
  }

  isReplaying.value = true

  try {
    // Relance avec le même mode et toutes les catégories mémorisées.
    await gameStore.loadGame(parameters)
    // Évite de revenir au jeu si le joueur a quitté cette page.
    if (!isPageActive) {
      return
    }

    if (gameStore.startError) {
      throw new Error(gameStore.startError)
    }

    // Les données sont prêtes ; la page de jeu démarrera le chrono.
    await router.replace({ name: 'game' })
  } catch (error) {
    // Affiche l’erreur sans relancer automatiquement la demande.
    replayError.value = error.message || 'Impossible de relancer la partie'
  } finally {
    isReplaying.value = false
  }
}
// Prépare l’identifiant du joueur et les états de chargement du profil.
const currentUserId = ref(null)
const isProfileLoading = ref(false)
const profileError = ref('')

onMounted(async () => {
  // L’invité conserve son aperçu flouté.
  if (!authToken) {
    return
  }

  isProfileLoading.value = true

  try {
    // Récupère le profil avec le service.
    const user = await getCurrentUser(authToken)

    // Vérifie la présence de l’identifiant attendu.
    if (!user || user.ID_user === undefined || user.ID_user === null) {
      throw new Error('Identifiant du joueur indisponible')
    }

    currentUserId.value = user.ID_user
  } catch (error) {
    // Une connexion expirée fait revenir à l’affichage invité.
    if (error.status === 401) {
      window.sessionStorage.removeItem(TOKEN_KEY)
      isGuest.value = true
      return
    }

    // Conserve les résultats même si le profil ne peut pas être récupéré.
    profileError.value = error.message || 'Impossible de récupérer le profil'
  } finally {
    isProfileLoading.value = false
  }
})

const logout = async () => {
  window.sessionStorage.removeItem(TOKEN_KEY)
  isGuest.value = true
  currentUserId.value = null
  gameStore.$reset()
  await router.push('/guesthome')
}
</script>
<template>
  <TheLoading v-if="isReplaying" fullscreen label="Préparation de la partie…" />

  <div class="result-layout" :inert="isReplaying">
    <TheHeader :is-authenticated="!isGuest" :show-guest-actions="!isGuest" @logout="logout" />

    <main v-if="gameStore.result" class="result-page">
      <!-- Résultat, points et accès aux corrections dans un même bloc. -->
      <section class="result-summary" aria-labelledby="result-title">
        <h1 id="result-title">Partie terminée !</h1>
        <p class="correct-count">
          {{ gameStore.result.summary.correct_answers }}
          / {{ gameStore.result.summary.question_count }} bonnes réponses
        </p>
        <p class="result-points">{{ gameStore.result.summary.score }} points</p>

        <button
          type="button"
          class="corrections-toggle"
          :aria-expanded="showCorrections"
          aria-controls="game-corrections"
          @click="toggleCorrections"
        >
          {{ showCorrections ? 'Masquer les corrections' : 'Voir les corrections' }}
        </button>

        <section v-show="showCorrections" id="game-corrections" class="result-corrections">
          <h2>Corrections</h2>
          <article
            v-for="(correction, index) in gameStore.result.corrections"
            :key="correction.question_id"
            class="correction-card"
          >
            <h3>Question {{ index + 1 }}</h3>
            <blockquote>{{ correction.quote_text }}</blockquote>
            <div class="correction-answers">
              <p
                class="player-answer"
                :class="{
                  'is-correct': correction.is_correct,
                  'is-incorrect': !correction.is_correct,
                }"
              >
                {{ correction.is_correct ? 'Bonne réponse :' : 'Ta réponse :' }}
                {{ correction.selected_movie_title ?? 'Aucune réponse validée' }}
              </p>
              <p v-if="!correction.is_correct" class="correct-answer">
                Bonne réponse : {{ correction.correct_movie_title }}
              </p>
            </div>
          </article>
        </section>
      </section>

      <section v-if="isGuest" class="signup-invitation" aria-labelledby="signup-title">
        <h2 id="signup-title">Entre dans le classement</h2>
        <p>
          Crée ton compte pour cumuler des points lors de tes prochaines parties et choisir tes
          genres.
        </p>
        <RouterLink :to="{ name: 'auth' }" class="signup-button"> Créer mon compte </RouterLink>
        <p class="login-invitation">
          Déjà un compte ?
          <RouterLink :to="{ name: 'auth', query: { mode: 'login' } }" class="text-link">
            Se connecter
          </RouterLink>
        </p>
      </section>

      <section v-else class="result-leaderboard" aria-label="Classement">
        <TheLoading v-if="isProfileLoading" label="Chargement du profil…" />
        <p v-else-if="profileError" class="result-error" role="alert">
          {{ profileError }}
        </p>
        <UsersLeaderboard
          v-else-if="currentUserId !== null"
          :current-user-id="currentUserId"
          mode="nearby"
        />
      </section>

      <section class="result-actions" aria-label="Actions après la partie">
        <p v-if="replayError" class="result-error" role="alert">{{ replayError }}</p>
        <button
          type="button"
          class="replay-button"
          :class="{ 'replay-button-guest': isGuest }"
          :disabled="isReplaying"
          @click="replayGame"
        >
          {{ isReplaying ? 'Chargement…' : isGuest ? 'Rejouer en invité' : 'Rejouer' }}
        </button>
        <RouterLink v-if="!isGuest" :to="{ name: 'create-game' }" class="configuration-button">
          Changer de mode
        </RouterLink>
      </section>
    </main>
  </div>
</template>

<style scoped>
.result-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #1c1c1c;
}

.result-page {
  box-sizing: border-box;
  flex: 1;
  padding: 24px 16px 40px;
  color: #f5efe3;
  font-family: 'Inter', sans-serif;
}

.result-page > section {
  box-sizing: border-box;
  max-width: 760px;
  margin: 0 auto 24px;
}

.result-summary {
  padding: 24px 16px;
  background-color: #2b2b2b;
  border: 2px solid #e9dfca;
  border-radius: 8px;
  box-shadow: 4px 4px 0 #000;
  text-align: center;
}

.result-summary h1 {
  margin: 0 0 16px;
}
.correct-count {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}
.result-points {
  margin: 12px 0;
  color: #ffb900;
  font-size: 1.6rem;
  font-weight: 800;
}

.corrections-toggle,
.replay-button-guest {
  min-height: 48px;
  padding: 10px 12px;
  background: transparent;
  color: #f5efe3;
  border: 0;
  border-radius: 5px;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.result-corrections {
  margin-top: 20px;
  text-align: left;
}
.correction-card {
  margin-top: 16px;
  padding: 16px;
  border: 2px solid #e9dfca;
  border-radius: 8px;
}
.correction-card blockquote {
  margin: 12px 0;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.correction-answers {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.correction-answers p {
  flex: 1 1 200px;
  min-width: 0;
  margin: 0;
  padding: 12px;
  border-radius: 6px;
  color: #111;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.player-answer.is-correct,
.correct-answer {
  background-color: #64a69d;
}
.player-answer.is-incorrect {
  background-color: #ff626b;
}

.signup-invitation {
  padding: 24px 20px;
  background-color: #f5efe3;
  color: #1c1c1c;
  border: 3px solid #111;
  border-radius: 8px;
  box-shadow: 4px 4px 0 #000;
  text-align: center;
}
.signup-invitation h2 {
  margin: 0 0 12px;
}
.signup-invitation p {
  line-height: 1.5;
}
.signup-button,
.replay-button:not(.replay-button-guest),
.configuration-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  max-width: 100%;
  padding: 12px 18px;
  background-color: #ffb900;
  color: #111;
  border: 3px solid #111;
  border-radius: 5px;
  box-shadow: 4px 4px 0 #000;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.signup-button {
  width: 100%;
  margin-top: 8px;
}
.signup-invitation .login-invitation {
  margin: 16px 0 0;
}
.text-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: inherit;
  text-underline-offset: 4px;
}
.result-actions {
  text-align: center;
}
.configuration-button {
  display: flex;
  width: fit-content;
  margin: 20px auto 0;
  background-color: #e9dfca;
}
.replay-button:disabled {
  opacity: 0.6;
  cursor: wait;
}
.result-error {
  color: #ff626b;
}
.corrections-toggle:focus-visible,
.signup-button:focus-visible,
.text-link:focus-visible,
.replay-button:focus-visible,
.configuration-button:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 5px;
}
</style>
