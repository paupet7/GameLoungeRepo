import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('../views/GamesView.vue')
    },
    {
      path: '/games/:id',
      name: 'game-detail',
      component: () => import('../views/GameDetailView.vue')
    },
    {
      path: '/games/:gameId/themes/:themeId',
      name: 'theme-detail',
      component: () => import('../views/ThemeDetailView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/games/:gameId/themes/:themeId/comments/:commentId',
      name: 'comment-detail',
      component: () => import('../views/CommentDetailView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('accessToken')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Redirect to games if already logged in and trying to access login/register
  if (to.meta.requiresGuest && accessToken) {
    return next('/games')
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !accessToken) {
    return next('/login')
  }
  
  // Check if route requires admin
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    return next('/games')
  }
  
  next()
})

export default router
