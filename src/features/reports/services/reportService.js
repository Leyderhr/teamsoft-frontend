import { api } from '@/lib/api'

const reportService = {
  // Listado de personas (tabla principal del reporte de personas)
  async getPersonReport() {
    return api.get('person').json()
  },
  // Búsqueda avanzada: filtra personas por los criterios del FilterDTO (AND).
  // Endpoint backend: POST /api/filter (FilterController)
  async filterPersons(payload) {
    return api.post('filter', { json: payload }).json()
  },
  // Reporte de una persona: sus datos + proyectos/roles/evaluaciones
  async getPersonDetail(personId) {
    return api.get(`person/${personId}/report`).json()
  },
  // Reporte de un equipo/proyecto: datos + miembros con rol y evaluación
  async getProjectDetail(projectId) {
    return api.get(`project/${projectId}/report`).json()
  },
}

export default reportService
