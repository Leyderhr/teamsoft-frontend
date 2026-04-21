import { api } from '@/lib/api'
const ageGroupService = {
  async getAll() { return api.get('ageGroups').json() },
  async getById(id) { return api.get(`ageGroups/${id}`).json() },
  async create(data) { return api.post('ageGroups', { json: data }).json() },
  async update(id, data) { return api.put(`ageGroups/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`ageGroups/${id}`).text() }
}
export default ageGroupService
