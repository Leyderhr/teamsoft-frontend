import { api } from '@/lib/api'
const religionService = {
  async getAll() { return api.get('religion').json() },
  async getById(id) { return api.get(`religion/${id}`).json() },
  async create(data) { return api.post('religion', { json: data }).json() },
  async update(id, data) { return api.put(`religion/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`religion/${id}`).text() }
}
export default religionService
