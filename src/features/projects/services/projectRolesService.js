import { api } from '@/lib/api'

const projectRolesService = {
  async getAll() { return api.get('project-roles').json() },
  async getById(id) { return api.get(`project-roles/${id}`).json() },
  async create(data) { return api.post('project-roles', { json: data }).json() },
  async update(id, data) { return api.put(`project-roles/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`project-roles/${id}`).text() }
}

export default projectRolesService
