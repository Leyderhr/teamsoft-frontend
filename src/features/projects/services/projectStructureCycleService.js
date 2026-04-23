import { api } from '@/lib/api'

const projectStructureCycleService = {
  async getAll() { return api.get('project-structure-cycle').json() },
  async getById(id) { return api.get(`project-structure-cycle/${id}`).json() },
  async create(data) { return api.post('project-structure-cycle', { json: data }).json() },
  async update(id, data) { return api.put(`project-structure-cycle/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`project-structure-cycle/${id}`).text() }
}

export default projectStructureCycleService
