/*import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
    { path: '/games', name: 'games', component: () => import('../views/GamesView.vue') },
    { path: '/games/:id', name: 'game-detail', component: () => import('../views/GameDetailView.vue') },
    { path: '/games/:gameId/themes/:themeId', name: 'theme-detail', component: () => import('../views/ThemeDetailView.vue') }
  ]
})

// Protected routes
router.beforeEach((to, from, next) => {
  const publicPages = ['login', 'register', 'home']
  const authRequired = !publicPages.includes(to.name)
  
  if (authRequired ) {
    next('/login')
  } else {
    next()
  
  }
})

export default router*/