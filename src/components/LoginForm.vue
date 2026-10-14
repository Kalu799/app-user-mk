<script setup>
import { ref } from 'vue'

// Valeur de base vide pour le login
const initialLoginState = () => ({
  mail: "",
  password: ""
})

// State des données du formulaire
const newLogin = ref(initialLoginState())

// Déclaration de l'émetteur
const emits = defineEmits(['dataFormLogin'])

// Fonction appelée au submit
const sendData = () => {
  emits('dataFormLogin', { ...newLogin.value })

  // Reset du formulaire
  newLogin.value = initialLoginState()
}
</script>

<template>
  <div class="form-wrapper">
    <h3>Login Form</h3>

    <form @submit.prevent="sendData">
      <label for="mail">Mail :</label>
      <input
        id="mail"
        type="email"
        name="mail"
        v-model.lazy.trim="newLogin.mail"
      >

      <label for="password">Password :</label>
      <input
        id="password"
        type="password"
        name="password"
        v-model.lazy.trim="newLogin.password"
      >

      <button>Se connecter</button>
    </form>
  </div>
</template>

<style scoped>
.form-wrapper {
  width: 100%;
  max-width: 350px;
  margin: 20px auto;
  padding: 16px;

  background-color: #bcbcbc;
  border-radius: 10px;
  box-sizing: border-box;
}

h3 {
  margin: 0 0 20px;
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #fff;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 10px 16px;

  background-color: #dedede;
  border: none;
  border-radius: 25px;
  outline: none;

  color: #222;
  font-size: 0.9rem;
  box-sizing: border-box;
}

input:focus {
  background-color: #f0f0f0;
  outline: 2px solid #888;
}

button {
  width: 100%;
  margin-top: 12px;
  padding: 12px;

  background-color: #555;
  color: white;

  border: none;
  border-radius: 25px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #333;
}

/* Tablette et desktop */
@media (min-width: 768px) {
  .form-wrapper {
    max-width: 400px;
    padding: 24px;
  }
}
</style>