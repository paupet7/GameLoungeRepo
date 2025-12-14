<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

    <!-- Tabs -->
    <div class="mb-8 border-b border-gray-200">
      <nav class="flex space-x-8">
        <button
          @click="activeTab = 'games'"
          :class="[
            'pb-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'games'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          Manage Games
        </button>
        <button
          @click="activeTab = 'themes'"
          :class="[
            'pb-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'themes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          Manage Themes
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'pb-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          Manage Users
        </button>
      </nav>
    </div>

    <!-- Games Management -->
    <div v-if="activeTab === 'games'" class="bg-white rounded-lg shadow-md p-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Games</h2>
        <button
          @click="openGameModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Add Game
        </button>
      </div>

      <!-- Games List -->
      <div class="space-y-4">
        <div
          v-for="game in games"
          :key="game.id"
          class="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ game.title }}</h3>
            <p class="text-gray-600 text-sm">{{ game.description }}</p>
            <span v-if="game.genre" class="text-xs text-blue-600">{{ game.genre }}</span>
          </div>
          <div class="flex space-x-2">
            <button
              @click="openGameModal(game)"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Edit
            </button>
            <button
              @click="deleteGame(game.id)"
              class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Themes Management -->
    <div v-if="activeTab === 'themes'" class="bg-white rounded-lg shadow-md p-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Themes</h2>
        
        <!-- Game Selector -->
        <select
          v-model="selectedGameId"
          @change="fetchThemes"
          class="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a game...</option>
          <option v-for="game in games" :key="game.id" :value="game.id">
            {{ game.title }}
          </option>
        </select>
      </div>

      <div v-if="selectedGameId">
        <button
          @click="openThemeModal()"
          class="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Add Theme
        </button>

        <!-- Themes List -->
        <div class="space-y-4">
          <div
            v-for="theme in themes"
            :key="theme.id"
            class="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ theme.title }}</h3>
              <p class="text-gray-600 text-sm">{{ theme.description }}</p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="openThemeModal(theme)"
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Edit
              </button>
              <button
                @click="deleteTheme(theme.id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Management -->
    <div v-if="activeTab === 'users'" class="bg-white rounded-lg shadow-md p-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Users</h2>
      </div>

      <!-- Search/Filter -->
      <div class="mb-6">
        <input
          v-model="userSearch"
          type="text"
          placeholder="Search users by username or email..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Loading Users -->
      <div v-if="loadingUsers" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Empty State / Error -->
      <div v-else-if="users.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
        <p class="text-gray-500 text-lg mb-2">No users found</p>
        <p class="text-gray-400 text-sm">The user management endpoint may not be configured yet.</p>
      </div>

      <!-- Users List -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.username }}
                    <span v-if="user.id === currentUserId" class="ml-2 text-xs text-blue-600">(You)</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  ]"
                >
                  {{ user.role === 'client' ? 'user' : user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    v-if="user.id !== currentUserId"
                    @click="openRoleModal(user)"
                    class="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Role
                  </button>
                  <button
                    v-if="user.id !== currentUserId"
                    @click="deleteUser(user.id)"
                    class="text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Game Modal -->
    <div v-if="showGameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-4">
          {{ editingGame ? 'Edit Game' : 'Add New Game' }}
        </h3>
        <form @submit.prevent="saveGame" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              v-model="gameForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="gameForm.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Genre</label>
            <input
              v-model="gameForm.genre"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              v-model="gameForm.imageUrl"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex space-x-4">
            <button
              type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {{ editingGame ? 'Update' : 'Create' }}
            </button>
            <button
              type="button"
              @click="closeGameModal"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add/Edit Theme Modal -->
    <div v-if="showThemeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-4">
          {{ editingTheme ? 'Edit Theme' : 'Add New Theme' }}
        </h3>
        <form @submit.prevent="saveTheme" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              v-model="themeForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="themeForm.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div class="flex space-x-4">
            <button
              type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {{ editingTheme ? 'Update' : 'Create' }}
            </button>
            <button
              type="button"
              @click="closeThemeModal"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Role Modal -->
    <div v-if="showRoleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-4">Change User Role</h3>
        <div class="mb-6">
          <p class="text-gray-600 mb-2">
            User: <span class="font-semibold">{{ editingUser?.username }}</span>
          </p>
          <p class="text-gray-600">
            Current Role: <span class="font-semibold">{{ editingUser?.role === 'client' ? 'user' : editingUser?.role }}</span>
          </p>
        </div>
        <form @submit.prevent="saveUserRole" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Role</label>
            <select
              v-model="newRole"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="flex space-x-4">
            <button
              type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Update Role
            </button>
            <button
              type="button"
              @click="closeRoleModal"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const authStore = useAuthStore()

const activeTab = ref('games')
const games = ref([])
const themes = ref([])
const users = ref([])
const selectedGameId = ref('')
const userSearch = ref('')

const showGameModal = ref(false)
const showThemeModal = ref(false)
const showRoleModal = ref(false)

const editingGame = ref(null)
const editingTheme = ref(null)
const editingUser = ref(null)

const loadingUsers = ref(false)
const newRole = ref('')

const gameForm = ref({
  title: '',
  description: '',
  genre: '',
  imageUrl: ''
})

const themeForm = ref({
  title: '',
  description: ''
})

const currentUserId = computed(() => authStore.user?.id)

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  
  const search = userSearch.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(search) ||
    user.email.toLowerCase().includes(search)
  )
})

const fetchGames = async () => {
  try {
    const { data } = await api.getGames()
    games.value = data
  } catch (err) {
    console.error('Failed to load games:', err)
  }
}

const fetchThemes = async () => {
  if (!selectedGameId.value) return
  
  try {
    const { data } = await api.getThemes(selectedGameId.value)
    themes.value = data
  } catch (err) {
    console.error('Failed to load themes:', err)
    themes.value = []
  }
}

const fetchUsers = async () => {
  try {
    loadingUsers.value = true
    const { data } = await api.getUsers()
    users.value = data
  } catch (err) {
    console.error('Failed to load users:', err)
    // Don't alert on initial load, just log the error
    // User management will show empty state
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

// Game Modal Functions
const openGameModal = (game = null) => {
  if (game) {
    editingGame.value = game
    gameForm.value = {
      title: game.title,
      description: game.description || '',
      genre: game.genre || '',
      imageUrl: game.imageUrl || ''
    }
  } else {
    editingGame.value = null
    gameForm.value = { title: '', description: '', genre: '', imageUrl: '' }
  }
  showGameModal.value = true
}

const closeGameModal = () => {
  showGameModal.value = false
  editingGame.value = null
  gameForm.value = { title: '', description: '', genre: '', imageUrl: '' }
}

const saveGame = async () => {
  try {
    if (editingGame.value) {
      await api.updateGame(editingGame.value.id, gameForm.value)
    } else {
      await api.createGame(gameForm.value)
    }
    closeGameModal()
    await fetchGames()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save game')
  }
}

const deleteGame = async (gameId) => {
  if (!confirm('Are you sure you want to delete this game?')) return
  
  try {
    await api.deleteGame(gameId)
    await fetchGames()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete game')
  }
}

// Theme Modal Functions
const openThemeModal = (theme = null) => {
  if (theme) {
    editingTheme.value = theme
    themeForm.value = {
      title: theme.title,
      description: theme.description || ''
    }
  } else {
    editingTheme.value = null
    themeForm.value = { title: '', description: '' }
  }
  showThemeModal.value = true
}

const closeThemeModal = () => {
  showThemeModal.value = false
  editingTheme.value = null
  themeForm.value = { title: '', description: '' }
}

const saveTheme = async () => {
  try {
    if (editingTheme.value) {
      await api.updateTheme(selectedGameId.value, editingTheme.value.id, themeForm.value)
    } else {
      await api.createTheme(selectedGameId.value, themeForm.value)
    }
    closeThemeModal()
    await fetchThemes()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save theme')
  }
}

const deleteTheme = async (themeId) => {
  if (!confirm('Are you sure you want to delete this theme?')) return
  
  try {
    await api.deleteTheme(selectedGameId.value, themeId)
    await fetchThemes()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete theme')
  }
}

// User Management Functions
const openRoleModal = (user) => {
  editingUser.value = user
  // Convert 'client' to 'user' for display
  newRole.value = user.role === 'client' ? 'user' : user.role
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  editingUser.value = null
  newRole.value = ''
}

const saveUserRole = async () => {
  try {
    // Map 'user' to 'client' for backend compatibility
    const backendRole = newRole.value === 'user' ? 'client' : newRole.value;
    await api.updateUserRole(editingUser.value.id, { role: backendRole })
    closeRoleModal()
    await fetchUsers()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to update user role')
  }
}

const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
  
  try {
    await api.deleteUser(userId)
    await fetchUsers()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete user')
  }
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
  // Only fetch users when the users tab is active to avoid errors on load
  if (activeTab.value === 'users') {
    fetchUsers()
  }
})

// Watch for tab changes and fetch users when switching to users tab
watch(activeTab, (newTab) => {
  if (newTab === 'users' && users.value.length === 0) {
    fetchUsers()
  }
})
</script>