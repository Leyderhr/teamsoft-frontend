import { api } from '@/lib/api'

const projectService = {
  async getAll() {
    return api.get('project').json()
  },
  async getById(id) {
    return api.get(`project/${id}`).json()
  },
  async create(project) {
    const data = Array.isArray(project) ? project : [project]
    return api.post('project', { json: data }).json()
  },
  async update(id, project) {
    return api.put(`project/${id}`, { json: project }).json()
  },
  async delete(id) {
    return api.delete(`project/${id}`).text()
  },
  async close(id) {
    return api.put(`project/close/${id}`).json()
  },
  async getByState(state) {
    return api.get(`project/state/${state}`).json()
  },
  async getNonBossAssignedRoles(id) {
    return api.get(`project/${id}/non-boss-assigned-roles`).json()
  },
  async finalize(id, evaluations) {
    return api.put(`project/finalize/${id}`, { json: evaluations }).json()
  },
  async getBossAssignedRole(id) {
    return api.get(`project/${id}/boss-assigned-role`).json()
  },
  async closeTeam(id, data) {
    return api.put(`project/close/${id}`, { json: data }).json()
  }
}

export default projectService
