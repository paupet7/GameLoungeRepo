<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      {{ error }}
    </div>

    <!-- Comment Content -->
    <div v-else>
      <!-- Back Button -->
      <button
        @click="$router.push(`/games/${$route.params.gameId}/themes/${$route.params.themeId}`)"
        class="mb-6 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to Discussion</span>
      </button>

      <!-- Comment Card -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Comment</h2>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span class="font-semibold text-gray-900">
                {{ comment.username || 'Anonymous' }}
              </span>
              <span>•</span>
              <span>{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt" class="text-xs text-gray-400 mt-1">
              Last edited {{ formatDate(comment.updatedAt) }}
            </p>
          </div>

          <!-- Action Buttons (if owner or admin) -->
          <div v-if="canModifyComment" class="flex space-x-2 flex-shrink-0">
            <button
              v-if="isOwner"
              @click="startEdit"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
            <button
              @click="handleDelete"
              class="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-if="editing" class="space-y-4">
          <textarea
            v-model="editContent"
            rows="10"
            maxlength="2000"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          ></textarea>
          <p class="text-sm text-gray-500">
            {{ editContent.length }}/2000 characters
          </p>
          <div class="flex space-x-2">
            <button
              @click="saveEdit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Save Changes
            </button>
            <button
              @click="cancelEdit"
              class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Full Comment Content -->
        <div v-else class="prose max-w-none">
          <p class="text-gray-700 whitespace-pre-wrap break-words text-lg leading-relaxed overflow-wrap-anywhere">
            {{ comment.content }}
          </p>
        </div>
      </div>

      <!-- Theme Context -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-2">Discussion Theme</h3>
        <p class="text-blue-800 break-words">
          This comment is part of the discussion: 
          <router-link 
            :to="`/games/${$route.params.gameId}/themes/${$route.params.themeId}`"
            class="font-medium underline hover:text-blue-600"
          >
            {{ theme.title || 'View Discussion' }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const comment = ref({})
const theme = ref({})
const loading = ref(true)
const error = ref('')
const editing = ref(false)
const editContent = ref('')

const isOwner = computed(() => {
  return authStore.isAuthenticated && comment.value.userId === authStore.user.id
})

const canModifyComment = computed(() => {
  return isOwner.value || authStore.isAdmin
})

const fetchComment = async () => {
  try {
    loading.value = true
    const { data } = await api.getComment(
      route.params.gameId, 
      route.params.themeId, 
      route.params.commentId
    )
    comment.value = data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load comment'
  } finally {
    loading.value = false
  }
}

const fetchTheme = async () => {
  try {
    const { data } = await api.getTheme(route.params.gameId, route.params.themeId)
    theme.value = data
  } catch (err) {
    console.error('Failed to load theme:', err)
  }
}

const startEdit = () => {
  editing.value = true
  editContent.value = comment.value.content
}

const saveEdit = async () => {
  if (!editContent.value.trim()) return

  try {
    await api.updateComment(
      route.params.gameId,
      route.params.themeId,
      route.params.commentId,
      { content: editContent.value }
    )
    
    editing.value = false
    await fetchComment()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to update comment')
  }
}

const cancelEdit = () => {
  editing.value = false
  editContent.value = ''
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this comment?')) return

  try {
    await api.deleteComment(
      route.params.gameId,
      route.params.themeId,
      route.params.commentId
    )
    
    router.push(`/games/${route.params.gameId}/themes/${route.params.themeId}`)
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete comment')
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await Promise.all([fetchComment(), fetchTheme()])
})
</script>

<style scoped>
/* Ensure text wraps properly */
.break-words {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>