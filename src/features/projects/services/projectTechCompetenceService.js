import { api } from '@/lib/api'

const projectTechCompetenceService = {
  async getAll() { return api.get('project-tech-competence').json() },
  async getById(id) { return api.get(`project-tech-competence/${id}`).json() },
  async create(data) { return api.post('project-tech-competence', { json: data }).json() },
  async update(id, data) { return api.put(`project-tech-competence/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`project-tech-competence/${id}`).text() }
}

export default projectTechCompetenceService
