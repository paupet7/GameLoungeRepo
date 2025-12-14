<template>
  <div class="flex items-center space-x-3">
    <!-- Animated Game Controller Logo -->
    <svg 
      :width="size" 
      :height="size" 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="logo-svg"
      :class="{ 'animate-pulse': animate }"
    >
      <!-- Background Circle with Gradient -->
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" filter="url(#shadow)"/>
      
      <!-- Game Controller Body -->
      <path 
        d="M12 20 C12 18, 14 16, 18 16 L30 16 C34 16, 36 18, 36 20 L36 26 C36 30, 34 32, 30 32 L18 32 C14 32, 12 30, 12 26 Z" 
        fill="white" 
        opacity="0.95"
      />
      
      <!-- D-Pad (Left side) -->
      <g class="dpad">
        <!-- Horizontal bar -->
        <rect x="15" y="22" width="8" height="2" rx="1" fill="#2563eb"/>
        <!-- Vertical bar -->
        <rect x="18" y="19" width="2" height="8" rx="1" fill="#2563eb"/>
      </g>
      
      <!-- Action Buttons (Right side) -->
      <g class="buttons">
        <circle cx="30" cy="21" r="2" fill="#ef4444" class="button-a"/>
        <circle cx="30" cy="27" r="2" fill="#3b82f6" class="button-b"/>
        <circle cx="27" cy="24" r="2" fill="#eab308" class="button-x"/>
        <circle cx="33" cy="24" r="2" fill="#22c55e" class="button-y"/>
      </g>
      
      <!-- Controller Grips -->
      <ellipse cx="15" cy="32" rx="3" ry="2" fill="white" opacity="0.6"/>
      <ellipse cx="33" cy="32" rx="3" ry="2" fill="white" opacity="0.6"/>
      
      <!-- Shine effect -->
      <path 
        d="M16 18 Q20 16, 24 16 Q28 16, 32 18" 
        stroke="white" 
        stroke-width="1.5" 
        stroke-opacity="0.4" 
        fill="none"
        stroke-linecap="round"
      />
    </svg>

    <!-- Text Logo -->
    <div v-if="showText" class="flex flex-col">
      <span :class="textClasses" class="font-bold leading-tight tracking-tight">
        Game<span class="text-blue-600">Lounge</span>
      </span>
      <span v-if="showTagline" class="text-xs text-gray-500 -mt-1">
        Your Gaming Hub
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 48
  },
  showText: {
    type: Boolean,
    default: true
  },
  showTagline: {
    type: Boolean,
    default: false
  },
  textSize: {
    type: String,
    default: 'text-2xl',
    validator: (value) => {
      return ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl'].includes(value)
    }
  },
  animate: {
    type: Boolean,
    default: false
  }
})

const textClasses = computed(() => {
  return `${props.textSize} text-gray-900`
})
</script>

<style scoped>
.logo-svg {
  transition: transform 0.3s ease;
}

.logo-svg:hover {
  transform: scale(1.05);
}

/* Subtle animation for buttons */
@keyframes buttonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.logo-svg:hover .button-a {
  animation: buttonPulse 1s ease-in-out infinite;
  animation-delay: 0s;
}

.logo-svg:hover .button-b {
  animation: buttonPulse 1s ease-in-out infinite;
  animation-delay: 0.2s;
}

.logo-svg:hover .button-x {
  animation: buttonPulse 1s ease-in-out infinite;
  animation-delay: 0.4s;
}

.logo-svg:hover .button-y {
  animation: buttonPulse 1s ease-in-out infinite;
  animation-delay: 0.6s;
}

/* D-pad hover effect */
.logo-svg:hover .dpad {
  transform-origin: 19px 23px;
  animation: dpadPress 0.5s ease-in-out;
}

@keyframes dpadPress {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.95); }
}
</style>