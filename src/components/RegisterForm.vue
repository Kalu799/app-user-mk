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
      <input type="text" name="pseudo" v-model.lazy.trim="newRegister.pseudo">
      <br>
      <label for="mail">Mail : </label>
      <input type="email" name="mail" v-model.lazy.trim="newRegister.mail">
      <br>
      <label for="password">Password : </label>
      <input type="password" name="password" v-model.lazy.trim="newRegister.password">
      <br>
      <button>Register</button>
    </form>
  </div>

</template>

<style scoped></style>