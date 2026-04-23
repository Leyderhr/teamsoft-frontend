import { api } from '@/lib/api'
const conflictIndexService = {
  async getAll() { return api.get('conflictIndex').json() },
  async getById(id) { return api.get(`conflictIndex/${id}`).json() },
  async create(data) { return api.post('conflictIndex', { json: data }).json() },
  async update(id, data) { return api.put(`conflictIndex/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`conflictIndex/${id}`).text() }
}
export default conflictIndexService
