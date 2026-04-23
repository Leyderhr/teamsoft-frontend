import { api } from '@/lib/api'
const nacionalityService = {
  async getAll() { return api.get('nacionality').json() },
  async getById(id) { return api.get(`nacionality/${id}`).json() },
  async create(data) { return api.post('nacionality', { json: data }).json() },
  async update(id, data) { return api.put(`nacionality/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`nacionality/${id}`).text() }
}
export default nacionalityService
