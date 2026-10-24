import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred'
    console.error('[API Error]', message)
    return Promise.reject(new Error(message))
  }
)

// Trip API
export const tripApi = {
  create: (data) => api.post('/trips', data),
  list: (params = {}) => api.get('/trips', { params }),
  get: (id) => api.get(`/trips/${id}`),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  regenerate: (id) => api.post(`/trips/${id}/regenerate`),
}

// Destination API
export const destinationApi = {
  list: (params = {}) => api.get('/destinations', { params }),
  get: (id) => api.get(`/destinations/${id}`),
  initSample: () => api.post('/destinations/init-sample'),
}

// Weather API
export const weatherApi = {
  get: (destination, startDate, endDate) => 
    api.get('/weather/' + encodeURIComponent(destination), {
      params: { start_date: startDate, end_date: endDate }
    }),
}

// Health API
export const healthApi = {
  check: () => api.get('/health'),
}

export default api