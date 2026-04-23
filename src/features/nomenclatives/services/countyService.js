import { api } from '@/lib/api'
const countyService = {
  async getAll() { return api.get('county').json() },
  async getById(id) { return api.get(`county/${id}`).json() },
  async create(data) { return api.post('county', { json: data }).json() },
  async update(id, data) { return api.put(`county/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`county/${id}`).text() }
}
export default countyService
