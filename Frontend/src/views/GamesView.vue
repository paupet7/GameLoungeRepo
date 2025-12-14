<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">All Games</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading games...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="games.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
      <p class="text-gray-500 text-lg">No games available yet.</p>
      <p v-if="authStore.isAdmin" class="text-gray-400 text-sm mt-2">
        Go to Admin panel to create games.
      </p>
    </div>

    <!-- Games Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="game in games"
        :key="game.id"
        class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer"
        @click="goToGame(game.id)"
      >
        <!-- Game Image -->
        <div class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <img
            v-if="game.imageUrl"
            :src="game.imageUrl"
            :alt="game.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="text-white text-6xl font-bold">
            {{ game.title.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- Game Info -->
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ game.title }}
          </h3>
          
          <p class="text-gray-600 text-sm mb-4 line-clamp-2">
            {{ game.description || 'No description available.' }}
          </p>

          <div class="flex items-center justify-between text-sm">
            <span v-if="game.genre" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {{ game.genre }}
            </span>
            
            <span class="text-gray-500">
              {{ formatDate(game.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const games = ref([])
const loading = ref(true)
const error = ref('')

const fetchGames = async () => {
  try {
    loading.value = true
    const { data } = await api.getGames()
    games.value = data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load games'
  } finally {
    loading.value = false
  }
}

const goToGame = (gameId) => {
  router.push(`/games/${gameId}`)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchGames()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>