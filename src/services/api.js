import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Usuarios
export const getUsuarios = () => api.get('/usuarios')
export const getUsuario = (id) => api.get(`/usuarios/${id}`)
export const createUsuario = (data) => api.post('/usuarios', data)
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

// Exámenes
export const getExamenesByUsuario = (usuarioId) => api.get(`/examenes/usuario/${usuarioId}`)
export const getExamen = (id) => api.get(`/examenes/${id}`)
export const createExamen = (data) => api.post('/examenes', data)
export const updateExamen = (id, data) => api.put(`/examenes/${id}`, data)
export const deleteExamen = (id) => api.delete(`/examenes/${id}`)

// Establecimientos
export const getEstablecimientos = () => api.get('/establecimientos')
export const getEstablecimiento = (id) => api.get(`/establecimientos/${id}`)
export const createEstablecimiento = (data) => api.post('/establecimientos', data)
export const updateEstablecimiento = (id, data) => api.put(`/establecimientos/${id}`, data)
export const deleteEstablecimiento = (id) => api.delete(`/establecimientos/${id}`)

// Aptitud
export const verificarAptitud = (usuarioId, establecimientoId) => 
  api.get(`/aptitud/usuario/${usuarioId}/establecimiento/${establecimientoId}`)

export const getResumenAptitud = () => api.get('/aptitud/resumen')

export default api
