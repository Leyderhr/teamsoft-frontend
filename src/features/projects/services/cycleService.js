import { api } from '@/lib/api'

const cycleService = {
  async getAll() { return api.get('cycle').json() },
  async getById(id) { return api.get(`cycle/${id}`).json() },
  async create(data) { return api.post('cycle', { json: data }).json() },
  async update(id, data) { return api.put(`cycle/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`cycle/${id}`).text() }
}

export default cycleService
