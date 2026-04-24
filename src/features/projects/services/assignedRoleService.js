import { api } from '@/lib/api'

const assignedRoleService = {
  async getAll() { return api.get('assigned-role').json() },
  async getById(id) { return api.get(`assigned-role/${id}`).json() },
  async getByProject(projectId) { return api.get(`assigned-role/project/${projectId}`).json() },
  async create(data) { return api.post('assigned-role', { json: data }).json() },
  async update(id, data) { return api.put(`assigned-role/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`assigned-role/${id}`).text() }
}

export default assignedRoleService
