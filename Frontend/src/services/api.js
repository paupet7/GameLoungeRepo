import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default {
  // Auth
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  
  // Games
  getGames: () => api.get('/games'),
  getGame: (id) => api.get(`/games/${id}`),
  createGame: (data) => api.post('/games', data),
  updateGame: (id, data) => api.put(`/games/${id}`, data),
  deleteGame: (id) => api.delete(`/games/${id}`),
  
  // Themes
  getThemes: (gameId) => api.get(`/games/${gameId}/themes`),
  createTheme: (gameId, data) => api.post(`/games/${gameId}/themes`, data),
  deleteTheme: (gameId, themeId) => api.delete(`/games/${gameId}/themes/${themeId}`),
  
  // Comments
  getComments: (gameId, themeId) => api.get(`/games/${gameId}/themes/${themeId}/comments`),
  createComment: (gameId, themeId, data) => api.post(`/games/${gameId}/themes/${themeId}/comments`, data),
  deleteComment: (gameId, themeId, commentId) => api.delete(`/games/${gameId}/themes/${themeId}/comments/${commentId}`)
}