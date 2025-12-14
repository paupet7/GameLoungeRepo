<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Back Button -->
      <button
        @click="$router.push(`/games/${$route.params.gameId}`)"
        class="mb-6 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to Game</span>
      </button>

      <!-- Theme Header -->
      <div class="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ theme.title }}
        </h1>
        <p class="text-gray-600 text-lg mb-4">
          {{ theme.description || 'No description.' }}
        </p>
        <div class="text-sm text-gray-500">
          Created {{ formatDate(theme.createdAt) }}
          <span v-if="theme.createdByUsername">by {{ theme.createdByUsername }}</span>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

        <!-- Add Comment Form (if authenticated) -->
        <div v-if="authStore.isAuthenticated" class="mb-8 border-b border-gray-200 pb-8">
          <form @submit.prevent="handleAddComment" class="space-y-4">
            <textarea
              v-model="newComment"
              rows="4"
              maxlength="2000"
              placeholder="Share your thoughts... (max 2000 characters)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            ></textarea>
            <p class="text-sm text-gray-500">
              {{ newComment.length }}/2000 characters
            </p>
            
            <button
              type="submit"
              :disabled="submitting"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium transition"
            >
              {{ submitting ? 'Posting...' : 'Post Comment' }}
            </button>

            <div v-if="commentError" class="text-red-600 text-sm mt-2">
              {{ commentError }}
            </div>
          </form>
        </div>

        <!-- Login Prompt -->
        <div v-else class="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-blue-800">
            <router-link to="/login" class="font-medium hover:underline">Login</router-link>
            to post comments
          </p>
        </div>

        <!-- Loading Comments -->
        <div v-if="loadingComments" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- No Comments -->
        <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>

        <!-- Comments List -->
        <div v-else class="space-y-6">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="border-b border-gray-200 pb-6 last:border-b-0"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="font-semibold text-gray-900">
                  {{ comment.username || 'Anonymous' }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatDate(comment.createdAt) }}
                </p>
              </div>

              <!-- Action Buttons (if owner or admin) -->
              <div v-if="canModifyComment(comment)" class="flex space-x-2">
                <button
                  v-if="comment.userId === authStore.user.id"
                  @click="startEditComment(comment)"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  @click="handleDeleteComment(comment.id)"
                  class="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>

            <!-- Edit Form (if editing this comment) -->
            <div v-if="editingCommentId === comment.id" class="space-y-4">
              <textarea
                v-model="editCommentContent"
                rows="4"
                maxlength="2000"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              ></textarea>
              <p class="text-sm text-gray-500">
                {{ editCommentContent.length }}/2000 characters
              </p>
              <div class="flex space-x-2">
                <button
                  @click="saveEditComment(comment.id)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Save
                </button>
                <button
                  @click="cancelEdit"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            <!-- Comment Content (with truncation) -->
            <div v-else>
              <p 
                class="text-gray-700 whitespace-pre-wrap"
                :class="{ 'line-clamp-6': !expandedComments.has(comment.id) }"
              >
                {{ comment.content }}
              </p>

              <!-- Read More/Less button (if comment is long) -->
              <button
                v-if="comment.content.length > 300"
                @click="toggleExpand(comment.id)"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
              >
                
              </button>

              <!-- View Full Comment Link -->
              <router-link
                :to="`/games/${$route.params.gameId}/themes/${$route.params.themeId}/comments/${comment.id}`"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block ml-4"
              >
                View Full Comment →
              </router-link>

              <p v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt" class="text-xs text-gray-400 mt-2">
                (edited {{ formatDate(comment.updatedAt) }})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const route = useRoute()
const authStore = useAuthStore()

const theme = ref({})
const comments = ref([])
const newComment = ref('')
const loading = ref(true)
const loadingComments = ref(true)
const submitting = ref(false)
const commentError = ref('')

const editingCommentId = ref(null)
const editCommentContent = ref('')
const expandedComments = ref(new Set())

const fetchTheme = async () => {
  try {
    const { data } = await api.getTheme(route.params.gameId, route.params.themeId)
    theme.value = data
  } catch (err) {
    console.error('Failed to load theme:', err)
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    loadingComments.value = true
    const { data } = await api.getComments(route.params.gameId, route.params.themeId)
    comments.value = data
  } catch (err) {
    console.error('Failed to load comments:', err)
    comments.value = []
  } finally {
    loadingComments.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return

  submitting.value = true
  commentError.value = ''

  try {
    await api.createComment(route.params.gameId, route.params.themeId, {
      content: newComment.value
    })
    
    newComment.value = ''
    await fetchComments()
  } catch (err) {
    commentError.value = err.response?.data?.error || 'Failed to post comment'
  } finally {
    submitting.value = false
  }
}

const startEditComment = (comment) => {
  editingCommentId.value = comment.id
  editCommentContent.value = comment.content
}

const saveEditComment = async (commentId) => {
  if (!editCommentContent.value.trim()) return

  try {
    await api.updateComment(
      route.params.gameId, 
      route.params.themeId, 
      commentId, 
      { content: editCommentContent.value }
    )
    
    cancelEdit()
    await fetchComments()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to update comment')
  }
}

const cancelEdit = () => {
  editingCommentId.value = null
  editCommentContent.value = ''
}

const handleDeleteComment = async (commentId) => {
  if (!confirm('Are you sure you want to delete this comment?')) return

  try {
    await api.deleteComment(route.params.gameId, route.params.themeId, commentId)
    await fetchComments()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete comment')
  }
}

const canModifyComment = (comment) => {
  if (!authStore.isAuthenticated) return false
  return comment.userId === authStore.user.id || authStore.isAdmin
}

const toggleExpand = (commentId) => {
  if (expandedComments.value.has(commentId)) {
    expandedComments.value.delete(commentId)
  } else {
    expandedComments.value.add(commentId)
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
  await fetchTheme()
  await fetchComments()
})
</script>

<style scoped>
.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>