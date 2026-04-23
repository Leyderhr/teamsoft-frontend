import { api } from '@/lib/api'
const costDistanceService = {
  async getAll() { return api.get('costDistance').json() },
  async getById(id) { return api.get(`costDistance/${id}`).json() },
  async create(data) { return api.post('costDistance', { json: data }).json() },
  async update(id, data) { return api.put(`costDistance/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`costDistance/${id}`).text() }
}
export default costDistanceService
