import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: credentials => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout')
}

export const calculationsAPI = {
  calculate: params => api.post('/calculate', params),
  getSystemParameters: () => api.get('/parameters'),
  updateSystemParameters: params => api.put('/parameters', params)
}

export default api 