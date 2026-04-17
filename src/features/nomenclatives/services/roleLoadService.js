import { api } from '@/lib/api'
const roleLoadService = {
  async getAll() { return api.get('roleLoad').json() },
  async getById(id) { return api.get(`roleLoad/${id}`).json() },
  async create(data) { return api.post('roleLoad', { json: data }).json() },
  async update(id, data) { return api.put(`roleLoad/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`roleLoad/${id}`).text() }
}
export default roleLoadService
