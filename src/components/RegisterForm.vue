<script setup>

import { ref } from 'vue'

// valeurs de base vide pour le form
const initialRegisterState = () => ({
  pseudo: "",
  mail: "",
  password: ""
})

// state des données du form
const newRegister = ref(initialRegisterState())

// emits 
const emits = defineEmits(['dataFormRegister'])

// fct appelée au submit du form
const sendData = () => {
  // emits des données vers le parent
  emits('dataFormRegister', { ...newRegister.value })
  // reset du form
  newRegister.value = initialRegisterState()
}

</script>

<template>

  <div class="form-wrapper">
    <h3>Register Form</h3>

    <form action="" @submit.prevent="sendData">
      <label for="pseudo">Pseudo : </label>
      <input id="pseudo" type="text" name="pseudo" v-model.lazy.trim="newRegister.pseudo">

      <label for="mail">Mail : </label>
      <input id="mail" type="email" name="mail" v-model.lazy.trim="newRegister.mail">

      <label for="password">Password : </label>
      <input id="password" type="password" name="password" v-model.lazy.trim="newRegister.password">

      <button>Register</button>
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