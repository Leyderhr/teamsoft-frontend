import { api } from '@/lib/api'
const levelsService = {
  async getAll() { return api.get('levels').json() },
  async getById(id) { return api.get(`levels/${id}`).json() },
  async create(data) { return api.post('levels', { json: data }).json() },
  async update(id, data) { return api.put(`levels/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`levels/${id}`).text() }
}
export default levelsService
