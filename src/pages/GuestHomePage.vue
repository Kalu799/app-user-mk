<script setup>
import { useRouter } from 'vue-router'

import { useGameStore } from '../stores/game'

import { ref, onUnmounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'

const selectedAnswer = ref(null)

const selectAnswer = (answer) => {
  selectedAnswer.value = selectedAnswer.value === answer ? null : answer
}

const scrollToRewards = () => {
  const el = document.getElementById('rewards')
  if (el) {
    const yOffset = -65 // Ajuste cette valeur (en pixels) pour remonter ou descendre le point d'arrêt
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}
// Récupère le store du jeu et le routeur déjà importés.
const gameStore = useGameStore()
const router = useRouter()

// Évite une navigation tardive si le joueur quitte cette page.
let isPageActive = true

onUnmounted(() => {
  isPageActive = false
})

const launchGuestGame = async () => {
  // Ignore les clics répétés pendant le chargement.
  if (gameStore.isStarting) {
    return
  }

  // Demande une partie toutes catégories auprès de l’API.
  await gameStore.loadGame(null)

  // Reste sur place en cas d’erreur et respecte un départ de la page.
  if (!isPageActive || gameStore.startError) {
    return
  }

  // Ouvre le jeu lorsque ses données sont disponibles.
  await router.push({ name: 'game' })
}
</script>

<template>
  <div class="guest-layout">
    <TheHeader />

    <main>
      <div class="hero">
        <img src="/crown.png" alt="Couronne" class="hero-crown" />
        <div class="hero-content">
          <h2>Devient le king du cinéma !</h2>
          <p>Entraine toi</p>
          <p>Participe aux tournois</p>
          <a href="#rewards" class="hero-link" @click.prevent="scrollToRewards">
            <p>Gagne des <span>PRIX</span> !</p>
          </a>
        </div>

        <div class="hero-img">
          <img src="/seat.png" alt="" />
        </div>
      </div>

      <div class="tuto-wrapper">
        <!-- COLONNE GAUCHE (MONSTRE) -->
        <div class="tuto-monster-column">
          <div class="monster-container">
            <img src="/crown.png" alt="" class="big-crown" />
            <img src="/ghoster-blue.png" alt="" class="tuto-monster" />
          </div>
        </div>

        <!-- COLONNE DROITE (QUIZ) -->
        <div class="tuto-content-column">
          <div class="tuto-header">
            <img src="/crown.png" alt="" />
            <h2>Comment jouer ?</h2>
          </div>

          <div class="tuto-question">
            <p>De quel film provient cette réplique</p>
          </div>

          <div class="tuto-quote">
            <p>"Attendez la crème ... !"</p>
          </div>

          <div class="tuto-answers-wrapper">
            <button
              class="tuto-answer"
              :class="{ selected: selectedAnswer === 'inglorious' }"
              :aria-pressed="selectedAnswer === 'inglorious'"
              @click="selectAnswer('inglorious')"
            >
              Inglorious Basterds
            </button>

            <button
              class="tuto-answer"
              :class="{ selected: selectedAnswer === 'django' }"
              :aria-pressed="selectedAnswer === 'django'"
              @click="selectAnswer('django')"
            >
              Django Unchained
            </button>
          </div>

          <!-- Lance la partie et indique son chargement. -->
          <button
            type="button"
            class="btn-play"
            :disabled="gameStore.isStarting"
            @click="launchGuestGame"
          >
            {{ gameStore.isStarting ? 'Chargement…' : 'JOUER' }}
          </button>

          <!-- Affiche une erreur de lancement sans ouvrir le jeu. -->
          <p v-if="gameStore.startError" role="alert">
            {{ gameStore.startError }}
          </p>
        </div>
        <!-- Fin tuto-content-column -->
      </div>
      <!-- Fin tuto-wrapper -->

      <div id="rewards" class="reward-wrapper">
        <h2>Nos récompenses</h2>

        <img src="/cinema.png" alt="photo d'une salle de cinéma" />

        <p>Gagne des tickets pour aller voir de nombreux films dans les cinéma participants</p>
        <p>Et aussi des superbes chapeaux pour personnaliser ton avatar</p>

        <div class="partners-wrapper">
          <img class="partner-img" src="/cinemalogo1.png" alt="photo ou logo d'un partenaire" />
          <img class="partner-img" src="/cinemalogo2.png" alt="photo ou logo d'un partenaire" />
        </div>
      </div>

      <div class="leaderboard-wrapper">
        <!-- Aperçu du top 10 -->
        <UsersLeaderboard mode="preview" />
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <nav class="footer-links" aria-label="Réseaux sociaux">
          <a href="#" @click.prevent>Instagram</a>
          <a href="#" @click.prevent>TikTok</a>
          <a href="#" @click.prevent>YouTube</a>
          <a href="#" @click.prevent>Discord</a>
        </nav>

        <div class="footer-bottom">
          <img src="/logokingwhite.png" alt="Movie Kings" class="footer-logo" />

          <p>© 2027 Movie Kings</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700;800&display=swap');

/* ======================================================== */
/* GENERAL / RESET */
/* ======================================================== */

:where(*, *::before, *::after) {
  box-sizing: border-box;
}

.guest-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #e5dbca;
  color: #f5efe3;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden; /* Empêche le scroll horizontal parasite sur mobile */
}

html {
  scroll-behavior: smooth;
}

/* ======================================================== */
/* MAIN */
/* ======================================================== */

main {
  width: 100%;
  margin-inline: auto;
}

main h2,
main h3 {
  font-family: 'Bricolage Grotesque', sans-serif;
  margin: 0;
}

main p {
  margin: 0;
}

/* ======================================================== */
/* HERO */
/* ======================================================== */

.hero {
  background: linear-gradient(#6fbaae, #6eb8ac, #5e9e94);
  padding: 40px 25px;
  margin-block: 15px;

  width: 100vw;
  height: 36rem;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  gap: 15px;

  text-align: center;
}
/* Cache la couronne du Hero sur ordinateur */
.hero-crown {
  display: none;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 12px;
}

.hero h2 {
  max-width: 600px;
  margin-bottom: 15px;

  font-size: clamp(3.5rem, 13vw, 5.5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  color: #fff5df;

  text-shadow: 3px 4px 0 #344b43;
}

.hero p {
  color: #173c37;
  font-size: 1.5rem;
  line-height: 1.5;
  font-weight: 500;
}

.hero-link {
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  /* Fond jaune vif ou crème contrasté */
  background-color: #ffb900;
  color: #1c1c1c;

  /* Bordure noire épaisse et nette */
  border: 2px solid #1c1c1c;
  border-radius: 8px;

  /* Ombre portée néobrutaliste classique */
  box-shadow: 4px 4px 0 #1c1c1c;

  padding: 12px 24px;
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;

  cursor: pointer;
  transition: all 0.1s ease-in-out;
}

/* Style du mot "PRIX" à l'intérieur pour le faire ressortir */
.hero-link span {
  background-color: #1c1c1c;
  color: #f5efe3;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Effet au survol : le bouton remonte et l'ombre s'agrandit */
.hero-link:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #1c1c1c;
  background-color: #ffc72c;
}

/* Effet au clic : le bouton s'enfonce */
.hero-link:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #1c1c1c;
}

.hero-img {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-img img {
  width: 100%;
  max-width: 450px;
  height: auto;
  object-fit: contain;
}

/* ======================================================== */
/* TUTORIEL */
/* ======================================================== */

.tuto-wrapper {
  padding: 80px 40px 0 40px;
  background-color: #1e1e1e;
  position: relative;
  overflow: visible;

  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 60px;

  max-width: 1400px;
  margin-inline: auto;
}

.tuto-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-image: url('/pattern.svg');
  background-repeat: repeat;
  background-position: center;

  opacity: 0.3;

  pointer-events: none;
  z-index: 0;
}

.tuto-wrapper > * {
  position: relative;
  z-index: 1;
}

/* -------------------------------------------------------- */
/* TUTORIEL : COLONNE GAUCHE (MONSTRE) */
/* -------------------------------------------------------- */

.tuto-monster-column {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  padding-inline-end: 20px;
  position: relative;
  z-index: 10;
}

.monster-container {
  position: relative;
  display: inline-block;
}

.tuto-monster {
  display: block;
  width: auto;
  height: 350px;
  object-fit: contain;

  transform: translateY(60px);
  margin-bottom: -60px;
}

.big-crown {
  position: absolute;
  top: -270px;
  left: 50%;
  transform: translateX(-50%);
  width: 350px;
  height: auto;
  z-index: 3;
}

/* -------------------------------------------------------- */
/* TUTORIEL : COLONNE DROITE (CONTENU & QUIZ) */
/* -------------------------------------------------------- */

.tuto-content-column {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  text-align: center;
}

.tuto-header {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.tuto-header h2 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  margin: 0;
}

.tuto-header img {
  position: absolute;
  top: -24px;
  right: -8.1px;
  width: 30px;
  height: auto;
  pointer-events: none;
}

.tuto-question {
  width: 100%;
  max-width: 500px;
  padding: 25px 15px;

  background-color: #2b2b2b;
  border-left: 5px solid #ff626b;

  text-align: center;
}

.tuto-question p {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
}

.tuto-quote {
  width: 100%;
  padding: 20px 10px;

  text-align: center;
  font-size: 1.1rem;
  font-style: italic;
  color: #e9dfca;
}

/* REPONSES */

.tuto-answers-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  width: 100%;
  max-width: 520px;
}

.tuto-answer {
  flex: 1;
  min-height: 75px;
  padding: 15px 12px;

  background-color: #f4ebd0;
  color: #1c1c1c;

  border: 2px solid #1c1c1c;
  border-radius: 8px;

  box-shadow: 0 4px 0 #1c1c1c;

  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  line-height: 1.3;
  font-weight: 700;

  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.tuto-answer:hover {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #1c1c1c;
}

.tuto-answer.selected {
  background-color: #ff626b;
  color: #fff5df;
  border-color: #1c1c1c;
  box-shadow: 0 2px 0 #1c1c1c;
  transform: translateY(2px);
}

/* BOUTON JOUER */

.btn-play {
  width: 70%;
  max-width: 250px;
  min-height: 55px;
  margin-top: 15px;
  padding: 12px 20px;

  background-color: #ffb900;
  color: #111;

  border: 3px solid #111;
  border-radius: 2px;
  box-shadow: 5px 5px 0 #000;

  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;

  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.btn-play:hover {
  transform: translate(3px, 3px);
  box-shadow: 2px 2px 0 #000;
}

/* ======================================================== */
/* RECOMPENSES */
/* ======================================================== */

.reward-wrapper {
  padding: 35px 20px;
  background-color: #ef5369;
  color: #fff5df;

  display: flex;
  flex-direction: column;
  gap: 15px;

  position: relative;
  overflow: visible;
  z-index: 1;
}

.reward-wrapper > img {
  display: block;
  width: 100%;
  height: 200px; /* Ajuste la hauteur selon tes besoins */
  border: 3px solid #1c1c1c;
  border-radius: 4px; /* Optionnel pour arrondir légèrement les coins */
  object-fit: cover; /* Évite que l'image soit déformée et remplit bien l'espace */
}

.reward-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-image: url('/pattern.svg');
  background-repeat: repeat;
  background-position: center;

  opacity: 0.4;

  pointer-events: none;
  z-index: 0;
}

.reward-wrapper > * {
  position: relative;
  z-index: 1;
}

.reward-wrapper h2 {
  font-size: clamp(2.7rem, 9vw, 3.8rem);
  font-weight: 800;
  line-height: 1;
}

.reward-wrapper > img {
  display: block;
  width: 100%;
  height: 180px;

  background-color: #d9475c;
  border: 3px solid #1c1c1c;
  object-fit: cover;
  color: white;
}

.reward-wrapper > p {
  font-size: 1.1rem;
  line-height: 1.6;
}

.reward-wrapper > p:nth-of-type(2) {
  font-size: 1rem;
  line-height: 1.5;
  color: #ffe0e4;
}

/* -------------------------------------------------------- */
/* RECOMPENSES : PARTENAIRES */
/* -------------------------------------------------------- */

.partners-wrapper {
  display: flex;
  justify-content: center; /* Centre les logos horizontalement */
  gap: 15rem; /* Augmente l'espace entre les deux logos */
  margin-top: 15px;
  width: 100%;
}

.partner-img {
  width: 150px;
  height: 120px;
  background-color: #f5efe3;
  border: 3px solid #1c1c1c;
  border-radius: 6px;
  box-shadow: 4px 4px 0 #1c1c1c;
  object-fit: contain;
  padding: 10px;
}

/* ======================================================== */
/* CLASSEMENT */
/* ======================================================== */

.leaderboard-wrapper {
  padding: 45px 20px;

  display: flex;
  flex-direction: column;
  gap: 20px;

  background-color: #1c1c1c;
}

.leaderboard-wrapper h2 {
  font-size: 2rem;
  font-weight: 800;
}

.leaderboard-wrapper p {
  padding: 25px 15px;
  background-color: #292929;
  border-left: 5px solid #ff626b;

  color: #ddd;
  text-align: center;
}

/* ======================================================== */
/* STYLE GROUPE : TUTO, RECOMPENSES & CLASSEMENT */
/* ======================================================== */

.tuto-wrapper,
.reward-wrapper,
.leaderboard-wrapper {
  width: 92%;
  max-width: 1300px;
  margin-inline: auto;
  box-sizing: border-box;
}

/* ======================================================== */
/* RESPONSIVE : TABLETTE (min-width: 768px) */
/* ======================================================== */

@media (min-width: 768px) {
  .hero {
    padding: 80px 40px;
  }

  .tuto-wrapper,
  .leaderboard-wrapper {
    padding: 60px 50px;
  }

  .tuto-answers-wrapper {
    max-width: 550px;
  }

  .tuto-question,
  .tuto-quote {
    max-width: 650px;
  }

  .reward-wrapper {
    padding: 60px 50px;
  }

  .reward-wrapper > img {
    height: 280px;
  }

  .partners-wrapper {
    max-width: 550px;
  }

  .partner-img {
    height: 160px;
  }
}

/* ======================================================== */
/* RESPONSIVE : DESKTOP (min-width: 1024px) */
/* ======================================================== */

@media (min-width: 1024px) {
  .hero {
    padding: 100px 50px;
  }

  .tuto-wrapper,
  .leaderboard-wrapper {
    padding: 80px;
  }

  .reward-wrapper {
    padding: 70px 80px;
  }

  .reward-wrapper > img {
    max-width: 700px;
    align-self: center;
  }

  .partners-wrapper {
    width: 100%;
    align-self: center;
  }
}

/* ======================================================== */
/* FOOTER */
/* ======================================================== */

.footer {
  width: 100%;
  margin-top: 3px;
  background-color: #181818;
  color: #e9dfca;
}

.footer-content {
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;
  padding: 35px 25px 25px;
}

.footer-links {
  display: flex;
  flex-direction: column;
}

.footer-links a {
  display: block;
  padding: 20px 0;

  color: #e9dfca;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 700;

  border-bottom: 1px dashed #444;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #ff626b;
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  margin-top: 65px;
  text-align: center;
}

.footer-logo {
  width: 85px;
  height: auto;
  object-fit: contain;
}

.footer-bottom p {
  margin: 0;
  color: #c9c1b5;
  font-size: 0.8rem;
}

/* ======================================================== */
/* FOOTER : TABLETTE ET DESKTOP */
/* ======================================================== */

@media (min-width: 768px) {
  .footer-content {
    padding: 45px 50px 30px;
  }

  .footer-links a {
    font-size: 1.1rem;
  }

  .footer-bottom {
    margin-top: 80px;
  }
}

/* ======================================================== */
/* RESPONSIVE : MOBILE EXCLUSIF (max-width: 767px) */
/* ======================================================== */

@media (max-width: 767px) {
  /* --- Hero Section Mobile --- */
  .hero {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: auto;
    padding: 0 15px 30px 15px; /* On laisse de la place en haut pour la couronne */
    gap: 20px;
    position: relative;
  }

  /* Masquer l'image du monstre sur le siège sur mobile */
  .hero-img {
    display: none !important;
  }

  /* Afficher et positionner la grande couronne au-dessus du texte */
  .hero-crown {
    display: block;
    width: 200px; /* Ajuste la largeur de la grande couronne selon tes préférences */
    height: auto;
    margin-bottom: -30px; /* Rapproche légèrement la couronne du titre */
    object-fit: contain;
  }

  .hero-content {
    align-items: center;
    text-align: center;
    width: 100%;
  }

  .hero h2 {
    font-size: clamp(2.3rem, 10vw, 3.2rem);
  }

  .hero p {
    font-size: 1.1rem;
  }

  .hero-link {
    width: 100%;
    max-width: 280px;
    font-size: 1rem;
    padding: 10px 18px;
  }

  /* Image principale Hero sur Mobile */
  .hero-img img {
    max-width: 260px;
  }

  /* --- Tutoriel Mobile --- */
  .tuto-wrapper {
    flex-direction: column; /* Place le texte au-dessus du monstre */
    align-items: center;
    padding: 40px 15px 60px 15px;
    gap: 20px;

    position: relative;
    overflow: visible !important; /* CRUCIAL : Permet au monstre de dépasser en bas du bloc noir */
  }

  .tuto-monster-column {
    order: 1; /* Place le monstre après le contenu textuel/boutons si ton tuto-content-column est à order: 1 */
    margin-top: 20px;
    position: relative;
    z-index: 1 !important;
  }

  /* Ajustements spécifiques des images du tutoriel (Monstre & Couronne) */
  .tuto-monster {
    height: 220px;
    transform: translateY(60px);
    margin-bottom: -40px;
    position: relative;
    z-index: 1;
  }

  .big-crown {
    top: -100px; /* Recalcule la hauteur pour qu'elle se pose bien sur la tête */
    width: 180px; /* Réduit la taille de la couronne sur mobile */
    z-index: -1; /* FORCÉ EN ARRIÈRE-PLAN : Passe derrière le bouton de manière inconditionnelle */
    pointer-events: none;
  }

  .tuto-header h2 {
    font-size: 1.8rem;
  }

  .tuto-header img {
    width: 22px;
    top: -16px;
    right: -6px;
  }

  /* Quiz Mobile */
  .tuto-content-column {
    position: relative;
    z-index: 10 !important; /* Force toute la colonne de contenu (quiz + bouton) au premier plan */
  }

  .tuto-answers-wrapper {
    flex-direction: column;
    gap: 10px;
  }

  .tuto-answer {
    min-height: 55px;
    font-size: 0.95rem;
  }

  .btn-play {
    position: relative;
    z-index: 20;
    width: 100%;
    max-width: 280px;
  }

  /* --- Récompenses & Partenaires Mobile --- */
  .reward-wrapper {
    padding: 25px 15px;
  }

  .reward-wrapper > img {
    height: 140px;
  }

  .partners-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 15px; /* Réduit l'espace vertical entre les deux blocs */
    margin-top: 15px;
  }

  /* Images logos partenaires sur Mobile */
  .partner-img {
    width: 100%;
    max-width: 220px;
    height: 90px;
  }
}
</style>
