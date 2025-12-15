import axios from 'axios'

//const API_URL = 'http://localhost:3000/api'
const API_URL = import.meta.env.VITE_API_URL 


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          })
          
          localStorage.setItem('accessToken', data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default {
  // Auth
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  
  // Games
  getGames: () => api.get('/games'),
  getGame: (id) => api.get(`/games/${id}`),
  createGame: (data) => api.post('/games', data),
  updateGame: (id, data) => api.put(`/games/${id}`, data),
  deleteGame: (id) => api.delete(`/games/${id}`),
  
  // Themes
  getThemes: (gameId) => api.get(`/games/${gameId}/themes`),
  getTheme: (gameId, themeId) => api.get(`/games/${gameId}/themes/${themeId}`),
  createTheme: (gameId, data) => api.post(`/games/${gameId}/themes`, data),
  updateTheme: (gameId, themeId, data) => api.put(`/games/${gameId}/themes/${themeId}`, data),
  deleteTheme: (gameId, themeId) => api.delete(`/games/${gameId}/themes/${themeId}`),
  
  // Comments
  getComments: (gameId, themeId) => api.get(`/games/${gameId}/themes/${themeId}/comments`),
  getComment: (gameId, themeId,commentId) => api.get(`/games/${gameId}/themes/${themeId}/comments/${commentId}`),
  createComment: (gameId, themeId, data) => api.post(`/games/${gameId}/themes/${themeId}/comments`, data),
  updateComment: (gameId, themeId, commentId, data) => api.put(`/games/${gameId}/themes/${themeId}/comments/${commentId}`, data),
  deleteComment: (gameId, themeId, commentId) => api.delete(`/games/${gameId}/themes/${themeId}/comments/${commentId}`),

  // Users (Admin only)
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUserRole: (id, data) => api.put(`/users/${id}/role`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
}