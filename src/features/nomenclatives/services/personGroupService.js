import { api } from '@/lib/api'
const personGroupService = {
  async getAll() { return api.get('personGroups').json() },
  async getById(id) { return api.get(`personGroups/${id}`).json() },
  async create(data) { return api.post('personGroups', { json: data }).json() },
  async update(id, data) { return api.put(`personGroups/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`personGroups/${id}`).text() }
}
export default personGroupService
