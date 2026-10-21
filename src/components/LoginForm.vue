<script setup>
import { ref } from 'vue'
// Reçoit l’état de chargement géré par la page.
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// Valeur de base vide pour le login
const initialLoginState = () => ({
  mail: '',
  password: '',
})

// State des données du formulaire
const newLogin = ref(initialLoginState())

// Déclaration de l'émetteur
const emits = defineEmits(['dataFormLogin'])

// Fonction appelée au submit
const sendData = () => {
  if (props.isLoading) {
    return
  }

  // Transmet une copie sans effacer la saisie.
  emits('dataFormLogin', { ...newLogin.value })
}
</script>

<template>
  <div class="form-wrapper">
    <h3>Login Form</h3>

    <form @submit.prevent="sendData">
      <label for="mail">Mail :</label>
      <input id="mail" type="email" name="mail" v-model.lazy.trim="newLogin.mail" />

      <label for="password">Password :</label>
      <input id="password" type="password" name="password" v-model.lazy.trim="newLogin.password" />

      <button type="submit" :disabled="props.isLoading">
        {{ props.isLoading ? 'Connexion en cours…' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
:where(*, *::before, *::after) {
  box-sizing: border-box;
}

/* CARTE DU FORMULAIRE */

.form-wrapper {
  width: 100%;
  max-width: 400px;
  margin: 0;
  padding: 25px 20px;

  background-color: #2b2b2b;
  border-left: 5px solid #ff626b;
  border-radius: 2px;

  color: #f5efe3;
  font-family: 'Inter', sans-serif;
}

h3 {
  margin: 0 0 25px;

  color: #fff5df;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.1;
}

/* CHAMPS */

form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #f5efe3;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5;
}

input + label {
  margin-top: 12px;
}

input {
  width: 100%;
  min-height: 50px;
  padding: 12px 14px;

  background-color: #e9dfca;
  color: #1c1c1c;

  border: 3px solid #111;
  border-radius: 5px;

  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.4;

  transition:
    background-color 0.2s,
    border-color 0.2s;
}

input:hover {
  background-color: #fff5df;
}

input:focus {
  background-color: #fff5df;
  border-color: #ff626b;
  outline: 2px solid #ff626b;
  outline-offset: 2px;
}

/* BOUTON — même traitement que JOUER */

button {
  width: 100%;
  min-height: 55px;
  margin-top: 20px;
  padding: 12px 20px;

  background-color: #ffb900;
  color: #111;

  border: 3px solid #111;
  border-radius: 2px;
  box-shadow: 5px 5px 0 #000;

  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.4;
  text-transform: uppercase;

  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

button:hover {
  transform: translate(3px, 3px);
  box-shadow: 2px 2px 0 #000;
}

button:active {
  transform: translate(5px, 5px);
  box-shadow: none;
}

button:focus-visible {
  outline: 3px solid #ff626b;
  outline-offset: 6px;
}

/* TABLETTE ET DESKTOP */

@media (min-width: 768px) {
  .form-wrapper {
    padding: 30px 25px;
  }

  h3 {
    font-size: 1.8rem;
  }
}

/* RÉDUCTION DES ANIMATIONS */

@media (prefers-reduced-motion: reduce) {
  input,
  button {
    transition: none;
  }
}
</style>
