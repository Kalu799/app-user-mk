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
:where(*, *::before, *::after) {
  box-sizing: border-box;
}

.guest-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  font-family: sans-serif;
}

/* HEADER */

.header {
  background-color: #dcdcdc;
  width: 100%;
  padding-block: 1rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-inline: 2rem;
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
  padding: 15px;

  display: flex;
  flex-direction: column;
  gap: 15px;
}

main h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 400;
}

main p {
  margin: 0;
}

/* HERO */

.hero {
  background-color: #d9d9d9;
  border-radius: 8px;
  padding: 10px;

  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero p {
  padding-left: 5px;
  font-size: 0.9rem;
}

.hero span {
  color: red;
  text-transform: lowercase;
}

/* TUTORIEL */

.tuto-wrapper {
  background-color: #d9d9d9;
  border-radius: 8px;
  padding: 13px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.tuto-wrapper h2 {
  align-self: flex-start;
}

.tuto-question {
  width: 100%;
  min-height: 65px;
  padding: 15px;

  background-color: #000;
  border-radius: 10px;
  color: white;

  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.tuto-question p {
  font-size: 1.1rem;
}

.tuto-quote {
  text-align: center;
  font-size: 1rem;
}

.tuto-answers-wrapper {
  width: 100%;

  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.tuto-answer {
  width: 45%;
  min-height: 45px;
  padding: 8px;

  background-color: #b8b8b8;
  border: 2px solid transparent;
  border-radius: 12px;

  color: black;
  font-size: 1rem;
  cursor: pointer;

  transition: border-color 0.2s, background-color 0.2s;
}

.tuto-answer:hover {
  background-color: #a5a5a5;
}

.tuto-answer.selected {
  border-color: red;
  background-color: #c9c9c9;
}

.btn-play {
  width: 50%;
  max-width: 180px;
  min-height: 55px;
  margin-top: 5px;

  background-color: red;
  color: white;
  border: none;
  border-radius: 15px;

  font-size: 0.9rem;
  cursor: pointer;
}

.btn-play:hover {
  background-color: #d60000;
}

/* RECOMPENSES */

.reward-wrapper {
  background-color: #d9d9d9;
  border-radius: 8px;
  padding: 13px;

  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reward-wrapper h2 {
  text-align: center;
}

.reward-wrapper>img {
  display: block;
  width: 100%;
  height: 130px;

  background-color: #000;
  border-radius: 10px;
  object-fit: cover;
  color: white;
}

.reward-wrapper>p {
  font-size: 0.9rem;
  line-height: 1.3;
}

.reward-wrapper>p:nth-of-type(2) {
  color: #555;
  font-size: 0.8rem;
}

/* PARTENAIRES */

.partners-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.partner-img {
  width: calc(50% - 10px);
  height: 130px;

  background-color: black;
  border-radius: 12px;
  object-fit: contain;
  color: white;
}

/* CLASSEMENT */

.leaderboard-wrapper {
  background-color: #d9d9d9;
  border-radius: 8px;
  padding: 13px;

  display: flex;
  flex-direction: column;
  gap: 15px;
}

.leaderboard-wrapper h2 {
  text-align: center;
}

.leaderboard-wrapper p {
  background-color: #b8b8b8;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}

/* TABLETTE */

@media (min-width: 768px) {
  main {
    padding: 25px;
    gap: 25px;
  }

  .hero,
  .tuto-wrapper,
  .reward-wrapper,
  .leaderboard-wrapper {
    padding: 25px;
  }

  .tuto-question {
    min-height: 90px;
  }

  .tuto-answers-wrapper {
    max-width: 500px;
    justify-content: center;
  }

  .tuto-answer {
    width: 200px;
  }

  .reward-wrapper>img {
    height: 250px;
  }

  .partners-wrapper {
    justify-content: center;
  }

  .partner-img {
    width: 200px;
    height: 150px;
  }
}

/* DESKTOP */

@media (min-width: 1024px) {
  main {
    padding: 30px;
  }

  main h2 {
    font-size: 1.4rem;
  }

  .hero {
    gap: 15px;
  }

  .tuto-question {
    max-width: 700px;
  }

  .reward-wrapper>img {
    max-width: 700px;
    align-self: center;
  }
}
</style>