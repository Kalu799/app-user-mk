
<script setup>
import { ref } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'

const emotions = ['happy', 'neutral', 'sad', 'angry', 'surprised']
const colors = ['blue', 'red', 'yellow']

const hats = [
  { key: null, label: 'Sans chapeau' },
  { key: 'blue_crown', label: 'Couronne bleue' },
  { key: 'gold_crown', label: 'Couronne dorée' },
  { key: 'santa_hat', label: 'Bonnet' },
]

const selectedEmotion = ref('happy')
const selectedColor = ref('blue')
const selectedHat = ref(null)
const selectedSize = ref(120)

const previewUser = ref({
  user_avatar_color: selectedColor.value,
  user_avatar_emotion: selectedEmotion.value,
  user_avatar_hat_asset_key: selectedHat.value,
})

function updatePreview() {
  previewUser.value = {
    user_avatar_color: selectedColor.value,
    user_avatar_emotion: selectedEmotion.value,
    user_avatar_hat_asset_key: selectedHat.value,
  }
}
</script>

<template>
  <main class="test-page">
    <h1>Test des avatars</h1>
    <p class="notice">
      Page de test temporaire — aucune donnée n'est enregistrée.
    </p>

    <section class="controls">
      <label>
        Émotion
        <select v-model="selectedEmotion" @change="updatePreview">
          <option v-for="emotion in emotions" :key="emotion" :value="emotion">
            {{ emotion }}
          </option>
        </select>
      </label>

      <label>
        Couleur
        <select v-model="selectedColor" @change="updatePreview">
          <option v-for="color in colors" :key="color" :value="color">
            {{ color }}
          </option>
        </select>
      </label>

      <label>
        Chapeau
        <select v-model="selectedHat" @change="updatePreview">
          <option v-for="hat in hats" :key="hat.label" :value="hat.key">
            {{ hat.label }}
          </option>
        </select>
      </label>

      <label>
        Taille
        <select v-model.number="selectedSize">
          <option :value="40">40 px</option>
          <option :value="80">80 px</option>
          <option :value="120">120 px</option>
        </select>
      </label>
    </section>

    <section class="preview">
      <UserAvatar :user="previewUser" :size="selectedSize" />
      <p>
        {{ selectedEmotion }} · {{ selectedColor }} ·
        {{ selectedHat ?? 'sans chapeau' }} · {{ selectedSize }} px
      </p>
    </section>

    <h2>Comparaison des émotions</h2>

    <section class="emotion-grid">
      <div v-for="emotion in emotions" :key="emotion" class="emotion-card">
        <UserAvatar
          :user="{
            user_avatar_color: selectedColor,
            user_avatar_emotion: emotion,
            user_avatar_hat_asset_key: selectedHat,
          }"
          :size="80"
        />
        <span>{{ emotion }}</span>
      </div>
    </section>

    <h2>Comparaison des couleurs</h2>

    <section class="color-grid">
      <div v-for="color in colors" :key="color" class="emotion-card">
        <UserAvatar
          :user="{
            user_avatar_color: color,
            user_avatar_emotion: selectedEmotion,
            user_avatar_hat_asset_key: selectedHat,
          }"
          :size="80"
        />
        <span>{{ color }}</span>
      </div>
    </section>

    <h2>Comparaison des chapeaux</h2>

    <section class="hat-grid">
      <div v-for="hat in hats" :key="hat.label" class="emotion-card">
        <UserAvatar
          :user="{
            user_avatar_color: selectedColor,
            user_avatar_emotion: selectedEmotion,
            user_avatar_hat_asset_key: hat.key,
          }"
          :size="100"
        />
        <span>{{ hat.label }}</span>
      </div>
    </section>
  </main>
</template>

<style scoped>
.test-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  color: #173c37;
  font-family: Inter, sans-serif;
}

.notice {
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #111;
  border-radius: 6px;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-block: 24px;
}

.controls label {
  display: grid;
  gap: 6px;
  font-weight: 700;
}

.controls select {
  min-width: 0;
  padding: 8px;
}


.preview {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 12px;
  box-sizing: border-box;
  background: #64a69d;
  border: 3px solid #111;
  border-radius: 8px;
}

.preview > * {
  transform: translateY(20px);
}

.emotion-grid,
.color-grid,
.hat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-block: 20px 32px;
}

.emotion-card {
  display: flex;
  min-width: 90px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 12px;
  background: #f5efe3;
  border: 2px solid #111;
  border-radius: 8px;
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .test-page {
    padding: 16px;
  }
}
</style>
