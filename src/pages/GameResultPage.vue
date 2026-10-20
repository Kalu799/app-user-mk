<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const router = useRouter()

// Choisit l’aperçu invité selon la présence d’un token.
const authToken = window.sessionStorage.getItem('movie-king-auth-token')
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
    // Demande une nouvelle partie avec la même catégorie.
    await gameStore.loadGame(parameters.ID_genre)

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
</script>

<template>
  <!-- Attend un résultat disponible avant d’afficher ses informations. -->
  <main v-if="gameStore.result" class="result-page">
    <section class="result-summary">
      <h1>Partie terminée</h1>

      <!-- Affiche le nombre de bonnes réponses obtenu auprès de l’API. -->
      <p class="correct-count">
        {{ gameStore.result.summary.correct_answers }}
        / {{ gameStore.result.summary.question_count }}
        bonnes réponses
      </p>
      <!-- Indique aussi aux outils d’accessibilité si les corrections sont ouvertes. -->
<button
  type="button"
  class="corrections-toggle"
  :aria-expanded="showCorrections"
  aria-controls="game-corrections"
  @click="toggleCorrections"
>
  {{ showCorrections ? 'Masquer les corrections' : 'Voir les corrections' }}
</button>
    </section>
    <!-- L’ouverture de cette section pousse naturellement le contenu suivant. -->
<section
  v-show="showCorrections"
  id="game-corrections"
  class="result-corrections"
>
  <h2>Corrections</h2>

  <!-- Construit une carte pour chaque réponse, dans l’ordre de la partie. -->
  <article
    v-for="(correction, index) in gameStore.result.corrections"
    :key="correction.question_id"
    class="correction-card"
  >
    <h3>Question {{ index + 1 }}</h3>

    <blockquote>{{ correction.quote_text }}</blockquote>

    <div class="correction-answers">
      <!-- La classe permettra de colorer la réponse en vert ou en rouge. -->
      <!-- Affiche le résultat et le film choisi, ou l’absence de réponse. -->
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

      <!-- En cas d’erreur ou d’expiration, affiche également le bon film. -->
      <p v-if="!correction.is_correct" class="correct-answer">
        Bonne réponse : {{ correction.correct_movie_title }}
      </p>
    </div>
  </article>
</section>
    <!-- Ce bloc restera sous les corrections lorsqu’elles seront ouvertes. -->
    <section class="result-score">
      <h2>Bravo !</h2>

      <!-- Affiche uniquement le score de cette partie. -->
      <p>
        {{ gameStore.result.summary.score }} points
      </p>
    </section>
    <!-- Accueillera le classement autour du joueur connecté. -->
<section class="result-leaderboard" aria-labelledby="leaderboard-title">
  <h2 id="leaderboard-title">Classement général</h2>

  <div v-if="isGuest" class="leaderboard-preview">
    <!-- Ces lignes sont décoratives et ne représentent aucun vrai joueur. -->
    <div class="leaderboard-placeholder" aria-hidden="true">
      <p v-for="line in 3" :key="line" class="leaderboard-row">
        — · Joueur · — points
      </p>
    </div>

    <!-- Le lien reste net et accessible au-dessus du classement flouté. -->
    <RouterLink
      :to="{ name: 'auth' }"
      class="leaderboard-invitation"
    >
      S’inscrire pour accéder au classement
    </RouterLink>
  </div>

  <!--
  À remplacer par le futur composant de classement.
  Besoin : joueur connecté + un joueur devant + un derrière.
  Les scores affichés seront les totaux des comptes.
-->
<div v-else>
  <p>Classement à venir</p>

  <!-- Ces lignes illustrent uniquement la disposition attendue. -->
  <p class="leaderboard-row">
    — · Joueur devant · — points
  </p>

  <p class="leaderboard-row is-current-user">
    — · Toi · — points
  </p>

  <p class="leaderboard-row">
    — · Joueur derrière · — points
  </p>
</div>
</section>
<!-- Regroupe les actions proposées après la partie. -->
<section class="result-actions" aria-label="Actions après la partie">
  <p v-if="replayError" class="result-error" role="alert">
    {{ replayError }}
  </p>

  <!-- Désactive le bouton pendant la préparation de la nouvelle partie. -->
  <button
    type="button"
    class="replay-button"
    :disabled="isReplaying"
    @click="replayGame"
  >
    {{ isReplaying ? 'Chargement…' : 'Rejouer' }}
  </button>
  <!-- Sera relié à la page de création de partie lorsqu’elle sera disponible. -->
<button
  type="button"
  class="configuration-button"
  aria-describedby="configuration-info"
  disabled
>
  Changer de mode
</button>

<!-- Explique pourquoi le bouton n’est pas encore accessible. -->
<p id="configuration-info" class="configuration-info">
  Configuration de partie bientôt disponible.
</p>
</section>
  </main>
</template>
<style scoped>
/* Reprend les couleurs principales de l’application. */
.result-page {
  box-sizing: border-box;
  min-height: 100dvh;
  padding: 24px 16px 40px;
  background-color: #1c1c1c;
  color: #f5efe3;
  font-family: 'Inter', sans-serif;
}

/* Limite la largeur du contenu sur les grands écrans. */
.result-page > section {
  max-width: 760px;
  margin-inline: auto;
  margin-bottom: 24px;
}

/* Centre le résumé et le score de la partie. */
.result-summary,
.result-score {
  text-align: center;
}

/* Reprend le bouton jaune utilisé pour les actions importantes. */
/* Partage le style jaune entre les deux boutons. */
.corrections-toggle,
.replay-button,
.configuration-button {
  min-height: 48px;
  padding: 12px 18px;
  background-color: #ffb900;
  color: #111;
  border: 3px solid #111;
  border-radius: 5px;
  box-shadow: 4px 4px 0 #000;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* Rend le bouton repérable lors d’une navigation au clavier. */
/* Rend les deux boutons repérables au clavier. */
.corrections-toggle:focus-visible,
.replay-button:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 5px;
}

/* Sépare visuellement les dix questions. */
.correction-card {
  margin-top: 16px;
  padding: 16px;
  background-color: #2b2b2b;
  border: 2px solid #e9dfca;
  border-radius: 8px;
}

/* Retire le retrait automatique des citations. */
.correction-card blockquote {
  margin: 12px 0;
  line-height: 1.5;
}

/* Place la réponse du joueur et la correction côte à côte. */
.correction-answers {
  display: flex;
  gap: 10px;
}

/* Partage la largeur disponible et laisse les longs titres revenir à la ligne. */
.correction-answers p {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 12px;
  border-radius: 6px;
  color: #111;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

/* Colore en vert une réponse correcte et le bon film indiqué. */
.player-answer.is-correct,
.correct-answer {
  background-color: #64a69d;
}

/* Colore en rouge une erreur ou une absence de réponse. */
.player-answer.is-incorrect {
  background-color: #ff626b;
}
/* Sert de repère pour placer l’invitation au-dessus des lignes. */
.leaderboard-preview {
  position: relative;
}

/* Floute uniquement les lignes décoratives. */
.leaderboard-placeholder {
  filter: blur(6px);
  user-select: none;
  pointer-events: none;
}

/* Donne aux placeholders l’apparence de lignes de classement. */
.leaderboard-row {
  margin: 8px 0;
  padding: 16px;
  background-color: #e9dfca;
  color: #111;
  border-radius: 6px;
}

/* Centre un lien bien lisible au-dessus de l’aperçu. */
.leaderboard-invitation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  box-sizing: border-box;
  width: min(85%, 320px);
  padding: 12px;

  background-color: #ffb900;
  color: #111;
  border: 3px solid #111;
  border-radius: 5px;
  box-shadow: 4px 4px 0 #000;

  text-align: center;
  text-decoration: none;
  font-weight: 700;
  line-height: 1.4;
}

/* Rend le lien repérable au clavier. */
.leaderboard-invitation:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 5px;
}
/* Met en évidence la future ligne du joueur connecté. */
.leaderboard-row.is-current-user {
  background-color: #ffb900;
  font-weight: 800;
}

/* Centre les actions de fin de partie. */
.result-actions {
  text-align: center;
}

/* Signale l’attente et empêche les clics répétés. */
.replay-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* Met en évidence une erreur de lancement. */
.result-error {
  color: #ff626b;
}
/* Place la configuration sous Rejouer avec un style secondaire. */
.configuration-button {
  display: block;
  margin: 20px auto 0;
  background-color: #e9dfca;
  opacity: 0.6;
  cursor: not-allowed;
}

/* Présente discrètement l’information de disponibilité. */
.configuration-info {
  font-size: 0.85rem;
  color: #e9dfca;
}
</style>