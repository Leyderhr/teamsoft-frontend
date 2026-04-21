import { api } from '@/lib/api'

const workerConflictService = {
  async getAll() {
    return api.get('worker-conflict').json()
  },
  async getById(id) {
    return api.get(`worker-conflict/${id}`).json()
  },
  async create(data) {
    return api.post('worker-conflict', { json: data }).json()
  },
  async update(id, data) {
    return api.put(`worker-conflict/${id}`, { json: data }).json()
  },
  async delete(id) {
    return api.delete(`worker-conflict/${id}`).text()
  }
}

export default workerConflictService
