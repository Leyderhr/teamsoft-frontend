import { api } from '@/lib/api'
const clientService = {
  async getAll() { return api.get('clients').json() },
  async getById(id) { return api.get(`clients/${id}`).json() },
  async create(data) { return api.post('clients', { json: data }).json() },
  async update(id, data) { return api.put(`clients/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`clients/${id}`).text() }
}
export default clientService
