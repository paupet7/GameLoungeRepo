<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo - Top Left -->
        <router-link to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            class="logo-svg"
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
              </filter>
            </defs>
            
            <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" filter="url(#shadow)"/>
            
            <path 
              d="M12 20 C12 18, 14 16, 18 16 L30 16 C34 16, 36 18, 36 20 L36 26 C36 30, 34 32, 30 32 L18 32 C14 32, 12 30, 12 26 Z" 
              fill="white" 
              opacity="0.95"
            />
            
            <g class="dpad">
              <rect x="15" y="22" width="8" height="2" rx="1" fill="#2563eb"/>
              <rect x="18" y="19" width="2" height="8" rx="1" fill="#2563eb"/>
            </g>
            
            <g class="buttons">
              <circle cx="30" cy="21" r="2" fill="#ef4444"/>
              <circle cx="30" cy="27" r="2" fill="#3b82f6"/>
              <circle cx="27" cy="24" r="2" fill="#eab308"/>
              <circle cx="33" cy="24" r="2" fill="#22c55e"/>
            </g>
            
            <ellipse cx="15" cy="32" rx="3" ry="2" fill="white" opacity="0.6"/>
            <ellipse cx="33" cy="32" rx="3" ry="2" fill="white" opacity="0.6"/>
            
            <path 
              d="M16 18 Q20 16, 24 16 Q28 16, 32 18" 
              stroke="white" 
              stroke-width="1.5" 
              stroke-opacity="0.4" 
              fill="none"
              stroke-linecap="round"
            />
          </svg>
          
          <span class="text-2xl font-bold text-gray-900">
            Game<span class="text-blue-600">Lounge</span>
          </span>
        </router-link>

        <!-- Navigation Links - Right Side -->
        <div class="flex items-center space-x-6">
          <router-link 
            to="/games" 
            class="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Games
          </router-link>
          
          <template v-if="authStore.isAuthenticated">
            <router-link 
              v-if="authStore.isAdmin" 
              to="/admin" 
              class="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Admin
            </router-link>
            
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                {{ authStore.user?.username }}
              </span>
              <button
                @click="handleLogout"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition"
              >
                Logout
              </button>
            </div>
          </template>
          
          <template v-else>
            <router-link 
              to="/login" 
              class="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Login
            </router-link>
            <router-link 
              to="/register" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
            >
              Register
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.logo-svg {
  transition: transform 0.3s ease;
}

.logo-svg:hover {
  transform: scale(1.05);
}
</style>