<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { RouterLink, useRouter } from 'vue-router'
import { getCurrentUser, getMyHats, updateMyAvatar } from '@/services/userService'

import BottomNav from '@/components/BottomNav.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheLoading from '@/components/TheLoading.vue'
import UserSummary from '@/components/UserSummary.vue'
import UserAvatar from '@/components/UserAvatar.vue'

const TOKEN_KEY = 'movie-king-auth-token'
const gameStore = useGameStore()
const router = useRouter()
const user = ref(null)
const errorMsg = ref('')
const isLoading = ref(true)
const avatarColor = ref('blue')
const avatarEmotion = ref('neutral')
const isAvatarEditorOpen = ref(false)
const avatarHat = ref(null)
const availableHats = ref([])
const isSavingAvatar = ref(false)
const avatarSaveError = ref('')

onMounted(async () => {
  const token = window.sessionStorage.getItem(TOKEN_KEY)

  if (!token) {
    gameStore.$reset()
    await router.replace('/auth')
    return
  }

  try {
    // Le service effectue la requête et vérifie la réponse.
    const profile = await getCurrentUser(token)

    // Ignore la réponse si la connexion a changé entre-temps.
    if (window.sessionStorage.getItem(TOKEN_KEY) !== token) {
      return
    }

    user.value = profile

    avatarColor.value = profile.user_avatar_color || 'blue'
    avatarEmotion.value = profile.user_avatar_emotion || 'neutral'
    avatarHat.value = profile.user_avatar_hat_asset_key || null
    availableHats.value = await getMyHats(token)
  } catch (error) {
    // Une ancienne requête ne doit pas affecter une nouvelle connexion.
    if (window.sessionStorage.getItem(TOKEN_KEY) !== token) {
      return
    }

    if (error.status === 401) {
      window.sessionStorage.removeItem(TOKEN_KEY)
      user.value = null
      await router.replace('/auth')
      return
    }

    errorMsg.value = error.message || 'Impossible de charger le profil'
  } finally {
    isLoading.value = false
  }
})

const logout = async () => {
  errorMsg.value = ''

  // Retire la connexion et les informations affichées du compte.
  window.sessionStorage.removeItem(TOKEN_KEY)
  user.value = null

  // Efface la partie, les réponses et les résultats précédents.
  gameStore.$reset()

  await router.push('/guesthome')
}

const saveAvatar = async () => {
  const token = window.sessionStorage.getItem(TOKEN_KEY)

  if (!token || isSavingAvatar.value) return

  isSavingAvatar.value = true
  avatarSaveError.value = ''

  try {
    const updatedProfile = await updateMyAvatar(token, {
      user_avatar_color: avatarColor.value,
      user_avatar_emotion: avatarEmotion.value,
      user_avatar_hat_id:
        availableHats.value.find((hat) => hat.hat_asset_key === avatarHat.value)?.ID_hat ?? null,
    })

    // Ignore la réponse si la connexion a changé entre-temps.
    if (window.sessionStorage.getItem(TOKEN_KEY) !== token) return

    // Le backend renvoie le profil actualisé : on utilise cette réponse.
    user.value = updatedProfile
    avatarColor.value = updatedProfile.user_avatar_color || 'blue'
    avatarEmotion.value = updatedProfile.user_avatar_emotion || 'neutral'
    avatarHat.value = updatedProfile.user_avatar_hat_asset_key || null

    isAvatarEditorOpen.value = false
  } catch (error) {
    if (window.sessionStorage.getItem(TOKEN_KEY) !== token) return

    if (error.status === 401) {
      window.sessionStorage.removeItem(TOKEN_KEY)
      user.value = null
      gameStore.$reset()
      await router.replace('/auth')
      return
    }

    avatarSaveError.value =
      error.status === 403
        ? 'Ce chapeau est verrouillé.'
        : error.message || 'Impossible de sauvegarder ton avatar.'
  } finally {
    isSavingAvatar.value = false
  }
}

const resetAvatarEditor = () => {
  avatarColor.value = user.value?.user_avatar_color || 'blue'
  avatarEmotion.value = user.value?.user_avatar_emotion || 'neutral'
  avatarHat.value = user.value?.user_avatar_hat_asset_key || null
  avatarSaveError.value = ''
}
</script>

<template>
  <TheHeader :is-authenticated="!!user" @logout="logout" />

  <TheLoading v-if="isLoading" fullscreen label="Chargement du profil…" />

  <main v-else-if="errorMsg" class="profile-page">
    <p class="profile-error" role="alert">
      {{ errorMsg }}
    </p>
  </main>

  <main v-else-if="user" class="profile-page">
    <h1 class="profile-title">Mon profil</h1>

    <!-- Identité -->
    <UserSummary v-if="user" :user="user" :pseudo="user.user_pseudo" :score="user.user_score" :show-avatar-edit="true"
      @edit-avatar="isAvatarEditorOpen = true" />

    <!-- Score réel -->
    <section class="profile-score" aria-labelledby="score-title">
      <div>
        <h2 id="score-title">Ton score total</h2>
        <p>Chaque partie compte !</p>
      </div>

      <p class="profile-score-value">
        {{ Number(user.user_score).toLocaleString('fr-BE') }}
        <span>points</span>
      </p>
    </section>

    <!-- Informations du compte -->
    <section class="profile-card" aria-labelledby="account-title">
      <h2 id="account-title">Mon compte</h2>

      <dl class="profile-details">
        <div>
          <dt>Pseudo</dt>
          <dd>{{ user.user_pseudo }}</dd>
        </div>

        <div>
          <dt>Adresse e-mail</dt>
          <dd>{{ user.user_mail }}</dd>
        </div>
      </dl>
    </section>

    <!-- Fonctionnalités à venir -->
    <section class="profile-card" aria-labelledby="progress-title">
      <div class="profile-card-heading">
        <h2 id="progress-title">Ta progression</h2>
      </div>

      <p class="profile-description">
        Ton parcours de cinéphile prend forme. De nouvelles récompenses arriveront prochainement.
      </p>

      <ul class="profile-features">
        <li>
          <span class="profile-feature-symbol" aria-hidden="true">↗</span>
          <div>
            <h3>Niveaux</h3>
            <p>Gravis les échelons au fil des parties.</p>
          </div>
        </li>

        <li>
          <span class="profile-feature-symbol" aria-hidden="true">★</span>
          <div>
            <h3>Badges et titres</h3>
            <p>Collectionne les distinctions qui te ressemblent.</p>
          </div>
        </li>

        <li>
          <span class="profile-feature-symbol" aria-hidden="true">✦</span>
          <div>
            <h3>Avatar personnalisé</h3>
            <p>Donne ton propre style à ton profil.</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Modale de personnalisation de l'avatar -->
    <div v-if="isAvatarEditorOpen" class="avatar-modal-overlay" @click.self="
      resetAvatarEditor();
    isAvatarEditorOpen = false
      ">
      <section class="avatar-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-modal-title">
        <button type="button" class="avatar-modal-close" aria-label="Fermer" @click="
          resetAvatarEditor();
        isAvatarEditorOpen = false
          ">
          ×
        </button>

        <h2 id="avatar-modal-title">Personnalise ton avatar</h2>

        <p>Choisis l'apparence qui te correspond !</p>

        <div class="avatar-modal-preview">
          <UserAvatar :user="{
            ...user,
            user_avatar_color: avatarColor,
            user_avatar_emotion: avatarEmotion,
            user_avatar_hat_asset_key: avatarHat,
          }" :size="120" />
        </div>

        <div class="avatar-editor-field">
          <label>Couleur</label>

          <div class="avatar-color-options" role="group" aria-label="Choisir une couleur">
            <button type="button" class="avatar-color-option" :class="{ selected: avatarColor === 'blue' }"
              :aria-pressed="avatarColor === 'blue'" aria-label="Bleu" @click="avatarColor = 'blue'">
              <span class="avatar-color-swatch avatar-color-swatch--blue"></span>
            </button>

            <button type="button" class="avatar-color-option" :class="{ selected: avatarColor === 'red' }"
              :aria-pressed="avatarColor === 'red'" aria-label="Rouge" @click="avatarColor = 'red'">
              <span class="avatar-color-swatch avatar-color-swatch--red"></span>
            </button>

            <button type="button" class="avatar-color-option" :class="{ selected: avatarColor === 'yellow' }"
              :aria-pressed="avatarColor === 'yellow'" aria-label="Jaune" @click="avatarColor = 'yellow'">
              <span class="avatar-color-swatch avatar-color-swatch--yellow"></span>
            </button>
          </div>
        </div>

        <div class="avatar-editor-field">
          <label>Expression</label>

          <div class="avatar-emotion-options" role="group" aria-label="Choisir une expression">
            <button v-for="emotion in [
              { value: 'happy', label: 'Heureux' },
              { value: 'neutral', label: 'Neutre' },
              { value: 'sad', label: 'Triste' },
              { value: 'angry', label: 'En colère' },
              { value: 'surprised', label: 'Surpris' },
            ]" :key="emotion.value" type="button" class="avatar-emotion-option"
              :class="{ selected: avatarEmotion === emotion.value }" :aria-pressed="avatarEmotion === emotion.value"
              :aria-label="emotion.label" @click="avatarEmotion = emotion.value">
              <UserAvatar :user="{
                ...user,
                user_avatar_color: avatarColor,
                user_avatar_emotion: emotion.value,
                user_avatar_hat_asset_key: null,
              }" :size="64" />

              <span>{{ emotion.label }}</span>
            </button>
          </div>
        </div>

        <div class="avatar-editor-field">
          <label>Chapeau</label>
          <div class="avatar-hat-options">
            <!-- Option pour retirer le chapeau -->
            <button type="button" class="avatar-hat-option" :class="{ selected: avatarHat === null }"
              :aria-pressed="avatarHat === null" aria-label="Aucun chapeau" @click="avatarHat = null">
              <div class="avatar-hat-preview avatar-hat-preview--empty">
                <span class="avatar-no-hat-symbol" aria-hidden="true"></span>
              </div>

              <span>Aucun chapeau</span>
            </button>

            <!-- Une vignette par chapeau disponible -->
            <button v-for="hat in availableHats" :key="hat.ID_hat" type="button" class="avatar-hat-option" :class="{
              selected: avatarHat === hat.hat_asset_key,
              locked: !hat.unlocked,
            }" :aria-pressed="avatarHat === hat.hat_asset_key"
              :aria-label="`${hat.hat_name}${!hat.unlocked ? `, niveau ${hat.hat_required_level} requis` : ''}`"
              :disabled="!hat.unlocked" @click="avatarHat = hat.hat_asset_key">
              <div class="avatar-hat-preview">
                <UserAvatar :user="{
                  ...user,
                  user_avatar_color: avatarColor,
                  user_avatar_emotion: avatarEmotion,
                  user_avatar_hat_asset_key: hat.hat_asset_key,
                }" :size="64" />
              </div>

              <span>{{ hat.hat_name }}</span>

              <small v-if="!hat.unlocked"> Niveau {{ hat.hat_required_level }} requis 🔒 </small>

              <small v-else-if="hat.equipped"> Équipé </small>
            </button>
          </div>
        </div>

        <p v-if="avatarSaveError" class="avatar-save-error" role="alert">
          {{ avatarSaveError }}
        </p>

        <div class="avatar-modal-actions">
          <button type="button" class="avatar-cancel-button" :disabled="isSavingAvatar" @click="
            resetAvatarEditor()
          isAvatarEditorOpen = false
            ">
            Annuler
          </button>

          <button type="button" class="avatar-save-button" :disabled="isSavingAvatar" @click="saveAvatar">
            {{ isSavingAvatar ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </section>
    </div>
  </main>

  <BottomNav />
</template>

<style scoped>
.profile-page,
.profile-page * {
  box-sizing: border-box;
}

.profile-page {
  --profile-cream: #fff5df;
  --profile-dark: #292929;
  --profile-green: #64a69d;

  width: calc(100% - 32px);
  max-width: 760px;
  margin: 24px auto 0;
  padding-bottom: calc(80px + 32px + env(safe-area-inset-bottom, 0px));

  color: var(--profile-cream);
  font-family: 'Inter', sans-serif;
}

.profile-page h1,
.profile-page h2,
.profile-page h3,
.profile-page p {
  margin: 0;
}

.profile-title,
.profile-identity h2,
.profile-card h2,
.profile-score-value {
  font-family: 'Bricolage Grotesque', sans-serif;
}

.profile-page .profile-title {
  margin-bottom: 24px;
  color: #292929;
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 800;
  line-height: 1.15;
}

/* IDENTITÉ */

.profile-identity {
  display: flex;
  align-items: center;
  gap: 16px;

  padding: 24px 16px;
  background: var(--profile-green);
  border: 3px solid #344b43;
  border-radius: 6px;
  box-shadow: 5px 5px 0 #344b43;
}

.profile-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;

  width: 68px;
  height: 68px;

  background: var(--profile-cream);
  color: #344b43;

  border: 3px solid #344b43;
  border-radius: 50%;
  overflow: hidden;
}

.profile-avatar svg {
  width: 80%;
  height: 80%;
}

@media (min-width: 640px) {
  .profile-avatar {
    width: 88px;
    height: 88px;
  }
}

.profile-identity-text {
  min-width: 0;
}

.profile-eyebrow {
  color: #182f2b;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.5;
}

.profile-identity h2 {
  margin-top: 4px;
  color: #182f2b;
  font-size: clamp(1.4rem, 6vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.profile-role {
  display: inline-block;
  margin-top: 12px;
  padding: 5px 10px;

  background: var(--profile-cream);
  color: #292929;

  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.4;
}

/* SCORE */

.profile-score {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  margin-top: 28px;
  padding: 22px 18px;

  background: var(--profile-dark);
  border: 2px solid #3c3c38;
  border-left: 5px solid #ffb900;
  border-radius: 6px;
}

.profile-score h2 {
  color: var(--profile-cream);
  font-size: 1rem;
  font-weight: 700;
}

.profile-score div>p {
  margin-top: 6px;
  color: #d5cec2;
  font-size: 0.9rem;
  line-height: 1.5;
}

.profile-score-value {
  color: #ffcb45;
  font-size: clamp(2rem, 9vw, 3rem);
  font-weight: 800;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.profile-score-value span {
  display: block;
  margin-top: 5px;

  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
}

/* BLOCS */

.profile-card {
  margin-top: 24px;
  padding: 22px 18px;

  background: var(--profile-dark);
  border: 2px solid #3c3c38;
  border-radius: 6px;
}

.profile-card h2 {
  color: var(--profile-cream);
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.25;
}

.profile-card-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.profile-coming-soon {
  padding: 6px 10px;
  background: #e9dfca;
  color: #292929;
  border-radius: 3px;

  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
}

/* INFORMATIONS DU COMPTE */

.profile-details {
  margin: 20px 0 0;
}

.profile-details>div {
  padding: 16px 0;
  border-top: 1px solid #50504a;
}

.profile-details>div:last-child {
  padding-bottom: 0;
}

.profile-details dt {
  color: #d5cec2;
  font-size: 0.85rem;
  font-weight: 600;
}

.profile-details dd {
  margin: 7px 0 0;
  color: var(--profile-cream);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

/* PROGRESSION À VENIR */

.profile-page .profile-description {
  margin-top: 16px;
  color: #d5cec2;
  font-size: 0.95rem;
  line-height: 1.7;
}

.profile-features {
  display: grid;
  gap: 20px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.profile-features li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.profile-feature-symbol {
  display: grid;
  place-items: center;
  flex-shrink: 0;

  width: 44px;
  height: 44px;

  background: #344b43;
  color: var(--profile-cream);
  border: 1px solid var(--profile-green);
  border-radius: 6px;

  font-size: 1.5rem;
}

.profile-features h3 {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
}

.profile-features p {
  margin-top: 5px;
  color: #d5cec2;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* ERREUR */

.profile-error {
  padding: 20px;
  background: var(--profile-dark);
  border-left: 5px solid #ff626b;
  border-radius: 4px;
  line-height: 1.6;
}

/* TABLETTE ET DESKTOP */

@media (min-width: 640px) {
  .profile-page {
    width: calc(100% - 48px);
    margin-top: 32px;
  }

  .profile-identity {
    gap: 24px;
    padding: 32px;
  }

  .profile-initials {
    width: 88px;
    height: 88px;
    font-size: 2rem;
  }

  .profile-card,
  .profile-score {
    padding: 28px;
  }

  .profile-details>div {
    display: grid;
    grid-template-columns: 160px minmax(0, 1fr);
    align-items: baseline;
    gap: 20px;
  }

  .profile-details dd {
    margin: 0;
  }
}

.avatar-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 0 0 / 65%);
}

.avatar-modal {
  position: relative;
  width: min(100%, 480px);
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px 24px;
  border-radius: 20px;
  background: #fff;
  color: #222;
  text-align: center;
  box-shadow: 0 16px 48px rgb(0 0 0 / 25%);
}

.avatar-modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 32px;
  cursor: pointer;
}

.avatar-modal-preview {
  display: flex;
  justify-content: center;
  margin: 28px 0;
}

.avatar-modal-placeholder {
  color: #666;
  font-size: 0.9rem;
}

.avatar-editor-field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin-top: 20px;
  text-align: left;
}

.avatar-editor-field label {
  font-weight: 700;
}

/* Sélecteur visuel de couleur */
.avatar-color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.avatar-color-option {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  padding: 5px;
  border: 2px solid #d6d6d6;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.avatar-color-option.selected {
  border-color: #292929;
  box-shadow: 0 0 0 2px #ff626b;
}

.avatar-color-option:hover {
  transform: translateY(-2px);
}

.avatar-color-option:focus-visible {
  outline: 3px solid #292929;
  outline-offset: 3px;
}

.avatar-color-swatch {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 7px;
}

.avatar-color-swatch--blue {
  background: #85c4ff;
}

.avatar-color-swatch--red {
  background: #ff626b;
}

.avatar-color-swatch--yellow {
  background: #ffcb45;
}

.avatar-emotion-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.avatar-emotion-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  padding: 12px 4px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: #fff;
  color: #222;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.avatar-emotion-option.selected {
  border-color: #ff626b;
  background: #fff0f1;
  box-shadow: 0 0 0 1px #ff626b;
}

.avatar-emotion-option:hover {
  border-color: #ff626b;
}

.avatar-emotion-option:focus-visible {
  outline: 3px solid #292929;
  outline-offset: 3px;
}

.avatar-emotion-option span {
  text-align: center;
  overflow-wrap: anywhere;
}

@media (min-width: 480px) {
  .avatar-emotion-options {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.avatar-editor-field select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #fff;
  color: #222;
  font: inherit;
}

.avatar-hat-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.avatar-hat-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
  min-height: 0;
  padding: 8px 5px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: #fff;
  color: #222;
  font: inherit;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.avatar-hat-preview {
  display: grid;
  place-items: center;
  width: 100%;
  height: 46px;
  min-height: 46px;
  overflow: hidden;
  border-radius: 8px;
  background: #fff5df;
}

/* Dans les vignettes, afficher uniquement le sprite du chapeau */
.avatar-hat-preview :deep(.avatar-body),
.avatar-hat-preview :deep(.avatar-eyes),
.avatar-hat-preview :deep(.avatar-mouth) {
  display: none;
}

.avatar-hat-preview :deep(.avatar-hat) {
  transform: none;
}

.avatar-hat-preview--empty {
  background: #f1eee8;
}

.avatar-no-hat-symbol {
  position: relative;
  display: block;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
  border: 3px solid #a5a5a5;
  border-radius: 50%;
  background: #e9e7e2;
  overflow: hidden;
}

.avatar-no-hat-symbol::after {
  content: '';
  position: absolute;
  width: 130%;
  height: 4px;
  top: 50%;
  left: 50%;
  border-radius: 1px;
  background: #929292;
  transform: translate(-50%, -50%) rotate(-45deg);
}

.avatar-hat-option.selected {
  border-color: #ff626b;
  background: #fff0f1;
  box-shadow: 0 0 0 1px #ff626b;
}

.avatar-hat-option:hover:not(:disabled) {
  border-color: #ff626b;
}

.avatar-hat-option:focus-visible {
  outline: 3px solid #292929;
  outline-offset: 3px;
}

.avatar-hat-option.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.avatar-hat-option small {
  font-size: 0.75rem;
  line-height: 1.4;
  text-align: center;
}

@media (min-width: 480px) {
  .avatar-hat-options {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.avatar-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.avatar-modal-actions button {
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.avatar-cancel-button {
  background: #eee;
  color: #222;
}

.avatar-save-button {
  background: #ff626b;
  color: #fff;
}

.avatar-modal-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.avatar-save-error {
  margin-top: 18px;
  color: #c62828;
  font-weight: 600;
}
</style>
