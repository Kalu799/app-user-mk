<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { RouterLink, useRouter } from 'vue-router'
import { getCurrentUser } from '@/services/userService'

import BottomNav from '@/components/BottomNav.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheLoading from '@/components/TheLoading.vue'

const TOKEN_KEY = 'movie-king-auth-token'
const gameStore = useGameStore()
const router = useRouter()
const user = ref(null)
const errorMsg = ref('')
const isLoading = ref(true)

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
    <section class="profile-identity" aria-label="Ton profil">
      <div class="profile-avatar" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="currentColor">
          <circle cx="32" cy="22" r="12" />
          <path d="M10 58a22 22 0 0 1 44 0Z" />
        </svg>
      </div>

      <div class="profile-identity-text">
        <p class="profile-eyebrow">Bienvenue</p>

        <h2>{{ user.user_pseudo }}</h2>

        <span class="profile-role">
          {{
            user.user_role === 'admin'
              ? 'Administrateur'
              : user.user_role === 'player'
                ? 'Joueur'
                : user.user_role
          }}
        </span>
      </div>
    </section>

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
        <span class="profile-coming-soon">À venir</span>
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

.profile-score div > p {
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

.profile-details > div {
  padding: 16px 0;
  border-top: 1px solid #50504a;
}

.profile-details > div:last-child {
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

  .profile-details > div {
    display: grid;
    grid-template-columns: 160px minmax(0, 1fr);
    align-items: baseline;
    gap: 20px;
  }

  .profile-details dd {
    margin: 0;
  }
}
</style>
