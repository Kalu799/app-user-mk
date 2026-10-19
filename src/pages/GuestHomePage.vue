<script setup>

import { RouterLink } from 'vue-router'

import { ref } from 'vue'

const selectedAnswer = ref(null)

const selectAnswer = (answer) => {
  selectedAnswer.value =
    selectedAnswer.value === answer ? null : answer
}

</script>

<template>

  <div class="guest-layout">
    <header class="header">
      <nav class="nav">
        <RouterLink to="/"><img src="/logo.png" alt="Movie King Logo" class="logo" /></RouterLink>
        <RouterLink to="/auth">Register/login</RouterLink>
      </nav>
    </header>

    <main>

      <div class="hero">
        <div class="hero-content">
          <h2>Devient le king du cinéma !</h2>
          <p>Entraine toi</p>
          <p>Participe aux tournois</p>
          <div class="hero-link">
            <p>Gagne des <span>PRIX</span> !</p>
          </div>
        </div>

        <div class="hero-img">
          <img src="/seat.png" alt="">
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
            <img src="/crown.png" alt="">
            <h2>Comment jouer ?</h2>
          </div>

          <div class="tuto-question">
            <p>De quel film provient cette réplique</p>
          </div>

          <div class="tuto-quote">
            <p>"Attendez la crème ... !"</p>
          </div>

          <div class="tuto-answers-wrapper">
            <button class="tuto-answer" :class="{ selected: selectedAnswer === 'inglorious' }"
              :aria-pressed="selectedAnswer === 'inglorious'" @click="selectAnswer('inglorious')">
              Inglorious Basterds
            </button>

            <button class="tuto-answer" :class="{ selected: selectedAnswer === 'django' }"
              :aria-pressed="selectedAnswer === 'django'" @click="selectAnswer('django')">
              Django Unchained
            </button>
          </div>

          <button class="btn-play">JOUER (WIP)</button>
        </div> <!-- Fin tuto-content-column -->
      </div> <!-- Fin tuto-wrapper -->

      <div class="reward-wrapper">
        <h2>Nos récompenses</h2>

        <img src="" alt="photo d'une salle de cinéma">

        <p>Gagne des tickets pour aller voir de nombreux films dans les cinéma participants</p>
        <p>Et aussi des superbes chapeaux pour personnaliser ton avatar</p>

        <div class="partners-wrapper">
          <img class="partner-img" src="" alt="photo ou logo d'un partenaire">
          <img class="partner-img" src="" alt="photo ou logo d'un partenaire">
        </div>
      </div>

      <div class="leaderboard-wrapper">
        <h2>Classement général</h2>
        <p>Il y aura un classement ici (WIP)</p>
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
  background-color: #E5DBCA;
  color: #f5efe3;
  font-family: 'Inter', sans-serif;
}

/* ======================================================== */
/* HEADER */
/* ======================================================== */

.header {
  background-color: #f5efe3;
  width: 100%;
  padding-block: .5rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-inline: 1rem;
}

.logo {
  height: 60px;
  object-fit: contain;
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
  background: linear-gradient(#6FBAAE, #6EB8AC, #5E9E94);
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

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
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
  font-size: 1.50rem;
  line-height: 1.5;
  font-weight: 500;
}

.hero-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  /* Fond verre givré subtil qui ressort très bien sur le turquoise */
  background: rgba(255, 245, 223, 0.15);
  backdrop-filter: blur(8px);
  
  /* Contour fin avec une touche corail/pêche */
  border: 1px solid rgba(255, 142, 117, 0.4);
  padding: 8px 18px;
  border-radius: 12px;
  
  color: #fff5df;
  font-size: 1.15rem;
  font-weight: 600;
  text-decoration: none;
  
  /* Ombre portée douce sous tout le bloc */
  box-shadow: 0 4px 15px rgba(23, 60, 55, 0.15);
  
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

/* Style spécifique pour le mot PRIX */
.hero-link span {
  background: linear-gradient(135deg, #ffc4ab 0%, #ff8e75 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Effet d'interaction sur TOUTE la cartouche au survol */
.hero-link:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 142, 117, 0.8);
  box-shadow: 0 6px 20px rgba(255, 142, 117, 0.25);
  background: rgba(255, 245, 223, 0.22);
}

.hero-img {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-img img {
  width: 100%;
  max-width: 450px; /* Change cette valeur pour grossir ou rétrécir l'image (ex: 250px, 400px...) */
  height: auto;
  object-fit: contain;
}

/* ======================================================== */
/* TUTORIEL */
/* ======================================================== */

.tuto-wrapper {
  padding: 80px 40px 0 40px; /* Plus d'espace en haut/bas */
  background-color: #1E1E1E;
  position: relative;
  overflow: visible; /* CRUCIAL : permet au monstre de dépasser en bas */
  
  /* Flexbox pour créer deux colonnes */
  display: flex;
  justify-content: space-between; /* Espace entre les deux colonnes */
  align-items: flex-end; /* Centre verticalement le monstre et le tuto */
  gap: 60px; /* Espace entre le monstre et le contenu du tuto */
  
  max-width: 1400px; /* Ajuste selon tes préférences, comme vu précédemment */
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
  background-repeat: repeat; /* Répète le motif en mosaïque */
  background-position: center;
  
  opacity: 0.3; /* */
  
  pointer-events: none; /* Permet d'interagir avec les éléments derrière si besoin */
  z-index: 0;
}

/* Force TOUS les enfants directs de .tuto-wrapper à passer au-dessus du pattern */
.tuto-wrapper > * {
  position: relative;
  z-index: 1;
}

/* -------------------------------------------------------- */
/* TUTORIEL : COLONNE GAUCHE (MONSTRE) */
/* -------------------------------------------------------- */

.tuto-monster-column {
  flex: 1; /* Prend l'espace disponible à gauche */
  display: flex;
  justify-content: flex-end; /* Pousse le monstre vers la droite DE SA COLONNE (le centre) */
  padding-inline-end: 20px; /* Ajuste pour le "recentrer" par rapport au tuto */
  position: relative;
  z-index: 10;
}

.monster-container {
  position: relative; /* Repère pour la couronne géante */
  display: inline-block;
}

.tuto-monster {
  display: block;
  width: auto;
  height: 350px; /* Ajuste la taille du monstre selon ton design */
  object-fit: contain;
  
  transform: translateY(60px);
  margin-bottom: -60px; /* Valeur négative = dépassement dans la section rouge */
}

.big-crown {
  position: absolute;
  top: -270px; /* Ajuste pour poser la couronne géante */
  left: 50%;
  transform: translateX(-50%); /* Centre la couronne sur la tête du monstre */
  width: 350px; /* Ajuste la taille de la couronne géante */
  height: auto;
  z-index: 3;
}

/* -------------------------------------------------------- */
/* TUTORIEL : COLONNE DROITE (CONTENU & QUIZ) */
/* -------------------------------------------------------- */

.tuto-content-column {
  flex: 1.2; /* Prend un peu plus d'espace que le monstre */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centre les éléments textuels entre eux */
  gap: 25px;
  text-align: center;
}

.tuto-header {
  position: relative; /* Permet de caler la couronne par rapport à cette boîte */
  display: inline-block; /* Ajuste la largeur du bloc au texte exact */
  margin-bottom: 20px;
}

/* Le titre principal */
.tuto-header h2 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  margin: 0;
}

/* La couronne positionnée au-dessus du '?' */
.tuto-header img {
  position: absolute;
  top: -24px;  /* Monte la couronne au-dessus du texte (ajuste entre -15px et -22px si besoin) */
  right: -8.1px;  /* Aligne la couronne au bout du texte (sur le point d'interrogation) */
  width: 30px;  /* Ajuste la taille de la couronne */
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
  transition: transform 0.15s,
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

  position: relative; /* Bloque le pattern dans ce conteneur */
  overflow: visible;   /* Empêche tout dépassement */
  z-index: 1;
}

.reward-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  background-image: url('/pattern.svg');
  background-repeat: repeat; /* Répète le motif en mosaïque */
  background-position: center;
  
  opacity: 0.4; /* */
  
  pointer-events: none; /* Permet d'interagir avec les éléments derrière si besoin */
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
  gap: 15px;
  margin-top: 10px;
}

.partner-img {
  height: 120px;

  background-color: #1c1c1c;
  border: 2px solid #f5efe3;
  border-radius: 5px;

  object-fit: contain;
  color: white;
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
  /* S'étend sur toute la largeur de l'écran (Full Width) */
  width: 92%;
  max-width: 1300px;
  margin-inline: auto;
  
  /* Centrage du contenu interne pour garder de la cohérence visuelle */
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
</style>