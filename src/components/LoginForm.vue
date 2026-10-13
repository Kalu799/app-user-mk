<script setup>
  import { ref } from 'vue'

  // Valeur de base vide pour le login
  const initialLoginState = () => ({
    mail: "",
    password: ""
  })

  //State des données du formulaire
  const newLogin = ref(initialLoginState())

  //Déclaration de l'émetteur
  const emits = defineEmits(['dataFormLogin'])

  //Fonction appelé au submit
  const sendData = () => {
    console.log('Données saisies dans le formulaire ;', newLogin.value)
    emits('dataFormLogin', {...newLogin.value})

    newLogin.value = initialLoginState()
  }
</script>

<template>
  <div class="form-warpper">

    <h3>Login Form</h3>

    <form @submit.prevent="sendData">
      <div>
        <label for="mail">Mail :</label>
        <input id="mail" type="mail" v-model.lazy.trim="newLogin.mail" required>
      </div>

      <div>
        <label for="password">Mot de passe</label>
        <input type="password" v-model.lazy.trim="newLogin.password" required>
      </div>

      <button type="submit">Se connecter</button>
    </form>
  </div>
</template>