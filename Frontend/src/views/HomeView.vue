<template>
  <div class="text-center">
    <!-- Hero Section -->
    <div class="py-20">
      <h1 class="text-6xl font-bold text-gray-900 mb-6">
        Welcome to <span class="text-blue-600">GameLounge</span>
      </h1>
      <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Your ultimate destination for gaming discussions, reviews, and community engagement.
      </p>
      
      <div class="flex justify-center space-x-4">
        <router-link
          to="/games"
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition"
        >
          Browse Games
        </router-link>
        <router-link
          v-if="!authStore.isAuthenticated"
          to="/register"
          class="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition"
        >
          Get Started
        </router-link>
      </div>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
      <div class="bg-white p-8 rounded-lg shadow-md">
        <div class="text-4xl mb-4">🎮</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Discover Games</h3>
        <p class="text-gray-600">
          Explore a wide variety of games and find your next favorite title.
        </p>
      </div>

      <div class="bg-white p-8 rounded-lg shadow-md">
        <div class="text-4xl mb-4">💬</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Join Discussions</h3>
        <p class="text-gray-600">
          Engage with the community through themed discussion boards.
        </p>
      </div>

      <div class="bg-white p-8 rounded-lg shadow-md">
        <div class="text-4xl mb-4">⭐</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Share Opinions</h3>
        <p class="text-gray-600">
          Comment, review, and share your gaming experiences with others.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>