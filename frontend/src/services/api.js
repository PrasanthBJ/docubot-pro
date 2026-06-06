import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
    baseURL: BASE_URL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ─── Auth ────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

// ─── Documents ───────────────────────────────────────────
export const uploadDocument = (formData) => api.post('/documents/upload', formData)
export const getAllDocuments = () => api.get('/documents')
export const deleteDocument = (id) => api.delete(`/documents/${id}`)

// ─── Chat ────────────────────────────────────────────────
export const askQuestion = (data) => api.post('/chat/ask', data)
export const getChatHistory = (documentId) => api.get(`/chat/history/${documentId}`)