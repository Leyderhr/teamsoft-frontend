import { api } from '@/lib/api'

const reportService = {
  // Listado de personas (tabla principal del reporte de personas)
  async getPersonReport() {
    return api.get('person').json()
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
