import { api } from '@/lib/api'
const raceService = {
  async getAll() { return api.get('race').json() },
  async getById(id) { return api.get(`race/${id}`).json() },
  async create(data) { return api.post('race', { json: data }).json() },
  async update(id, data) { return api.put(`race/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`race/${id}`).text() }
}
export default raceService
