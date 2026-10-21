<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories } from '@/services/categoryService'
import BottomNav from '@/components/BottomNav.vue'
import TheLoading from '@/components/TheLoading.vue'
import { useGameStore } from '@/stores/game'
import TheHeader from '@/components/TheHeader.vue'

const router = useRouter()
const gameStore = useGameStore()

// Le seul mode disponible actuellement.
const selectedMode = ref('find_movie')

// Toutes les catégories sont sélectionnées au départ.
const allCategories = ref(true)
const selectedCategoryIds = ref([])
const categories = ref([])
const isLoadingCategories = ref(false)
const categoriesError = ref('')

let isPageActive = true

onUnmounted(() => {
  isPageActive = false
})

// Retrouve les noms des catégories sélectionnées pour afficher leurs badges.
const selectedCategories = computed(() => {
  return categories.value.filter((category) =>
    selectedCategoryIds.value.includes(category.ID_genre),
  )
})

const selectAllCategories = () => {
  allCategories.value = true
  selectedCategoryIds.value = []
}

const toggleCategory = (categoryId) => {
  // Choisir une catégorie précise remplace le choix « Toutes ».
  allCategories.value = false

  if (selectedCategoryIds.value.includes(categoryId)) {
    selectedCategoryIds.value = selectedCategoryIds.value.filter((id) => id !== categoryId)
  } else {
    selectedCategoryIds.value = [...selectedCategoryIds.value, categoryId]
  }
}

const loadCategories = async () => {
  if (isLoadingCategories.value || !isPageActive) {
    return
  }

  isLoadingCategories.value = true
  categoriesError.value = ''

  try {
    const data = await getCategories()

    if (!isPageActive) {
      return
    }

    categories.value = data

    // Retire une ancienne sélection si sa catégorie n’existe plus.
    selectedCategoryIds.value = selectedCategoryIds.value.filter((id) =>
      data.some((category) => category.ID_genre === id),
    )
  } catch (error) {
    if (isPageActive) {
      categoriesError.value = error.message || 'Impossible de charger les catégories'
    }
  } finally {
    if (isPageActive) {
      isLoadingCategories.value = false
    }
  }
}

// Autorise le lancement lorsque la sélection est prête.
const canPlay = computed(() => {
  return (
    selectedMode.value === 'find_movie' &&
    !isLoadingCategories.value &&
    !categoriesError.value &&
    categories.value.length > 0 &&
    (allCategories.value || selectedCategoryIds.value.length > 0) &&
    !gameStore.isStarting
  )
})

const launchGame = async () => {
  if (!canPlay.value || !isPageActive) {
    return
  }

  const token = window.sessionStorage.getItem('movie-king-auth-token')

  // Vérifie que le joueur possède toujours une connexion.
  if (!token) {
    gameStore.$reset()
    await router.replace('/auth')
    return
  }

  // Transmet le mode et une copie des catégories choisies.
  await gameStore.loadGame({
    mode: selectedMode.value,
    genreIds: allCategories.value ? null : [...selectedCategoryIds.value],
  })

  // Ignore une réponse après un départ ou un changement de connexion.
  if (!isPageActive || window.sessionStorage.getItem('movie-king-auth-token') !== token) {
    return
  }

  if (gameStore.startError || !gameStore.game || gameStore.isStarting) {
    return
  }

  await router.push({ name: 'game' })

}

const logout = async () => {
  // Retire la connexion du compte.
  window.sessionStorage.removeItem('movie-king-auth-token')

  // Efface la partie et ignore ses éventuelles réponses tardives.
  gameStore.$reset()

  await router.push('/guesthome')
}

onMounted(async () => {
  // La configuration de partie est destinée aux joueurs connectés.
  if (!window.sessionStorage.getItem('movie-king-auth-token')) {
    await router.replace('/auth')
    return
  }

  await loadCategories()
})
</script>

<template>
  <!-- Affiche l’attente pendant la préparation du quiz. -->
  <TheLoading v-if="gameStore.isStarting" fullscreen label="Préparation de la partie…" />

  <div class="create-game-page" :inert="gameStore.isStarting">
    <TheHeader :is-authenticated="true" @logout="logout" />

    <main class="creation-content">
      <h1>Créer une partie</h1>

      <section aria-labelledby="mode-title">
        <h2 id="mode-title">Choisissez votre mode de jeu</h2>

        <div class="mode-list">
          <!-- Le seul mode jouable est présélectionné. -->
          <button
            type="button"
            class="mode-card"
            :aria-pressed="selectedMode === 'find_movie'"
            @click="selectedMode = 'find_movie'"
          >
            <strong>Réplique</strong>
            <span>Trouve de quel film provient la réplique.</span>
          </button>

          <button type="button" class="mode-card" disabled>
            <strong>Blanc-manger ciné</strong>
            <span>Bientôt disponible</span>
          </button>
        </div>
      </section>

      <section aria-labelledby="categories-title">
        <h2 id="categories-title">Choisissez les catégories</h2>

        <div class="category-panel">
          <TheLoading v-if="isLoadingCategories" label="Chargement des catégories…" />

          <div v-else-if="categoriesError">
            <p role="alert">{{ categoriesError }}</p>
            <button type="button" @click="loadCategories">Réessayer</button>
          </div>

          <p v-else-if="categories.length === 0">Aucune catégorie disponible.</p>

          <template v-else>
            <h3>Sélection</h3>

            <div class="category-list">
              <!-- Retirer ce badge permet de repartir d’une sélection vide. -->
              <button
                v-if="allCategories"
                type="button"
                class="selected-chip"
                aria-label="Retirer la sélection de toutes les catégories"
                @click="allCategories = false"
              >
                Toutes les catégories <span aria-hidden="true">×</span>
              </button>

              <template v-else>
                <button
                  v-for="category in selectedCategories"
                  :key="category.ID_genre"
                  type="button"
                  class="selected-chip"
                  :aria-label="`Retirer ${category.genre_name}`"
                  @click="toggleCategory(category.ID_genre)"
                >
                  {{ category.genre_name }}
                  <span aria-hidden="true">×</span>
                </button>

                <p v-if="selectedCategories.length === 0">Choisis au moins une catégorie.</p>
              </template>
            </div>

            <h3>Catégories disponibles</h3>

            <div class="category-list">
              <button
                type="button"
                class="category-chip"
                :aria-pressed="allCategories"
                @click="selectAllCategories"
              >
                Toutes
              </button>

              <button
                v-for="category in categories"
                :key="category.ID_genre"
                type="button"
                class="category-chip"
                :aria-pressed="selectedCategoryIds.includes(category.ID_genre)"
                @click="toggleCategory(category.ID_genre)"
              >
                {{ category.genre_name }}
              </button>
            </div>
          </template>
        </div>
      </section>

      <p class="game-rules">10 questions · 30 secondes par question</p>

      <!-- Conserve la sélection si le serveur refuse le lancement. -->
      <p v-if="gameStore.startError" role="alert">
        {{ gameStore.startError }}
      </p>

      <button type="button" class="play-button" :disabled="!canPlay" @click="launchGame">
        {{ gameStore.isStarting ? 'Chargement…' : 'Jouer' }}
      </button>
    </main>

    <BottomNav />
  </div>
</template>
<style scoped>
/* Réserve la place de la navigation fixe sur mobile. */
.create-game-page {
  box-sizing: border-box;
  min-height: 100dvh;
  padding-bottom: calc(110px + env(safe-area-inset-bottom, 0px));
  background-color: #1c1c1c;
  color: #f5efe3;
  font-family: 'Inter', sans-serif;
}

.creation-content {
  box-sizing: border-box;
  display: grid;
  gap: 24px;
  width: 100%;
  max-width: 640px;
  margin-inline: auto;
  padding: 32px 20px 48px;
}

.creation-content h1,
.creation-content h2,
.creation-content h3,
.creation-content p {
  margin: 0;
}

.creation-content h1 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(1.8rem, 6vw, 2.5rem);
  text-align: center;
}

.creation-content h2 {
  margin-bottom: 12px;
  font-size: 1.1rem;
  line-height: 1.4;
}

.creation-content h3 {
  font-size: 0.9rem;
}

/* Encadre les modes et la sélection des catégories. */
.mode-list,
.category-panel {
  padding: 16px;
  background-color: #2b2b2b;
  border: 3px solid #111;
  border-radius: 8px;
  box-shadow: 4px 4px 0 #000;
}

.mode-list {
  display: grid;
  gap: 12px;
}

.mode-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 14px;
  background-color: #e9dfca;
  color: #1c1c1c;
  border: 2px solid #111;
  border-radius: 8px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.mode-card[aria-pressed='true'] {
  background-color: #ff626b;
  outline: 2px solid #ffb900;
  outline-offset: 2px;
}

.mode-card span {
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Les badges reviennent à la ligne sur les petits écrans. */
.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 44px;
  margin: 12px 0 20px;
}

.category-chip,
.selected-chip {
  max-width: 100%;
  min-height: 44px;
  padding: 8px 12px;
  background-color: #f5efe3;
  color: #1c1c1c;
  border: 2px solid #111;
  border-radius: 999px;
  font: inherit;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.selected-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Alterne les couleurs disponibles dans la charte. */
.category-chip:nth-child(4n + 2) {
  background-color: #ff626b;
}

.category-chip:nth-child(4n + 3) {
  background-color: #ffb900;
}

.category-chip:nth-child(4n + 4) {
  background-color: #64a69d;
}

.category-chip[aria-pressed='true'] {
  box-shadow: inset 0 0 0 2px #111;
  outline: 2px solid #f5efe3;
  outline-offset: 2px;
}

.game-rules {
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: center;
}

.play-button {
  justify-self: center;
  width: 100%;
  max-width: 300px;
  min-height: 56px;
  padding: 12px 20px;
  background-color: #ffb900;
  color: #1c1c1c;
  border: 3px solid #111;
  border-radius: 6px;
  box-shadow: 4px 4px 0 #000;
  font: inherit;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
}

.mode-card:disabled,
.play-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.creation-content button:focus-visible {
  outline: 3px solid #f5efe3;
  outline-offset: 4px;
}
</style>
