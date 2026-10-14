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
        <RouterLink to="/"><img src="/Property 1=king.png" alt="Movie King Logo" class="logo" /></RouterLink>
        <RouterLink to="/auth">Register/login</RouterLink>
      </nav>
    </header>

    <main>

      <div class="hero">
        <h2>Devient le king du cinéma !</h2>
        <p>Entraine toi</p>
        <p>Participe aux tournois</p>
        <p>Gagne des <span>PRIX</span> !</p>
      </div>

      <div class="tuto-wrapper">
        <h2>Comment jouer ?</h2>

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
      </div>

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

  </div>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700;800&display=swap');

:where(*, *::before, *::after) {
  box-sizing: border-box;
}

.guest-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1c1c1c;
  color: #f5efe3;
  font-family: 'Inter', sans-serif;
}

/* HEADER */

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

/* MAIN */

main {
  width: 100%;
  max-width: 1100px;
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

/* HERO */

.hero {
  background-color: #64a69d;
  padding: 55px 25px;
  border-bottom: 6px solid #e9dfca;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;

  text-align: center;
}

.hero h2 {
  max-width: 320px;
  margin-bottom: 15px;

  font-size: clamp(2.5rem, 10vw, 4rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  color: #fff5df;

  text-shadow: 3px 4px 0 #344b43;
}

.hero p {
  color: #173c37;
  font-size: 0.95rem;
  font-weight: 500;
}

.hero span {
  color: #ffdd66;
  font-weight: 800;
}

/* TUTORIEL */

.tuto-wrapper {
  padding: 45px 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.tuto-wrapper h2 {
  width: 100%;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.tuto-question {
  width: 100%;
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
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.tuto-answer {
  flex: 1;
  min-height: 55px;
  padding: 10px;

  background-color: #e9dfca;
  color: #1c1c1c;

  border: 3px solid transparent;
  border-radius: 5px;

  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;

  cursor: pointer;
  transition: border-color 0.2s,
    background-color 0.2s;
}

.tuto-answer:hover {
  background-color: #fff5df;
}

.tuto-answer.selected {
  border-color: #ff626b;
  background-color: #fff5df;
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

/* RECOMPENSES */

.reward-wrapper {
  padding: 35px 20px;
  background-color: #ef5369;
  color: #fff5df;

  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reward-wrapper h2 {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
}

.reward-wrapper>img {
  display: block;
  width: 100%;
  height: 180px;

  background-color: #d9475c;
  border: 3px solid #1c1c1c;
  object-fit: cover;
  color: white;
}

.reward-wrapper>p {
  font-size: 0.95rem;
  line-height: 1.5;
}

.reward-wrapper>p:nth-of-type(2) {
  font-size: 0.85rem;
  color: #ffe0e4;
}

/* PARTENAIRES */

.partners-wrapper {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.partner-img {
  width: calc(50% - 7.5px);
  height: 120px;

  background-color: #1c1c1c;
  border: 2px solid #f5efe3;
  border-radius: 5px;

  object-fit: contain;
  color: white;
}

/* CLASSEMENT */

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

/* TABLETTE */

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

  .reward-wrapper>img {
    height: 280px;
  }

  .partners-wrapper {
    max-width: 550px;
  }

  .partner-img {
    height: 160px;
  }
}

/* DESKTOP */

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

  .reward-wrapper>img {
    max-width: 700px;
    align-self: center;
  }

  .partners-wrapper {
    width: 100%;
    align-self: center;
  }
}
</style>