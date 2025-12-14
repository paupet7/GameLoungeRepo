<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading game...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      {{ error }}
    </div>

    <!-- Game Content -->
    <div v-else>
      <!-- Back Button -->
      <button
        @click="$router.push('/games')"
        class="mb-6 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to Games</span>
      </button>

      <!-- Game Header -->
      <div class="bg-white rounded-lg shadow-md p-8 mb-8">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              {{ game.title }}
            </h1>
            
            <p class="text-gray-600 text-lg mb-4">
              {{ game.description || 'No description available.' }}
            </p>

            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span v-if="game.genre" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                {{ game.genre }}
              </span>
              <span>Created {{ formatDate(game.createdAt) }}</span>
              <span v-if="game.createdByUsername">by {{ game.createdByUsername }}</span>
            </div>
          </div>

          <!-- Game Image -->
          <div v-if="game.imageUrl" class="ml-8">
            <img
              :src="game.imageUrl"
              :alt="game.title"
              class="w-48 h-48 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>

      <!-- Themes Section -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Discussion Themes</h2>
        </div>

        <!-- Loading Themes -->
        <div v-if="loadingThemes" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- No Themes -->
        <div v-else-if="themes.length === 0" class="text-center py-8 text-gray-500">
          No discussion themes yet.
        </div>

        <!-- Themes List -->
        <div v-else class="space-y-4">
          <div
            v-for="theme in themes"
            :key="theme.id"
            class="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            @click="goToTheme(theme.id)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  {{ theme.title }}
                </h3>
                <p class="text-gray-600 mb-3">
                  {{ theme.description || 'No description.' }}
                </p>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{{ formatDate(theme.createdAt) }}</span>
                  <span v-if="theme.createdByUsername">by {{ theme.createdByUsername }}</span>
                </div>
              </div>

              <button
                class="ml-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                View Discussion →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const game = ref({})
const themes = ref([])
const loading = ref(true)
const loadingThemes = ref(true)
const error = ref('')

const fetchGame = async () => {
  try {
    loading.value = true
    const { data } = await api.getGame(route.params.id)
    game.value = data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load game'
  } finally {
    loading.value = false
  }
}

const fetchThemes = async () => {
  try {
    loadingThemes.value = true
    const { data } = await api.getThemes(route.params.id)
    themes.value = data
  } catch (err) {
    console.error('Failed to load themes:', err)
    themes.value = []
  } finally {
    loadingThemes.value = false
  }
}

const goToTheme = (themeId) => {
  router.push(`/games/${route.params.id}/themes/${themeId}`)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  await fetchGame()
  await fetchThemes()
})
</script>