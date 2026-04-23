import { api } from '@/lib/api'
const projectStructureService = {
  async getAll() { return api.get('project-structure').json() },
  async getById(id) { return api.get(`project-structure/${id}`).json() },
  async create(data) { return api.post('project-structure', { json: data }).json() },
  async update(id, data) { return api.put(`project-structure/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`project-structure/${id}`).text() }
}
export default projectStructureService
