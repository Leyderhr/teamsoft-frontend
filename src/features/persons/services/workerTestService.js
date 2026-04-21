import { api } from '@/lib/api'

const workerTestService = {
  async getAll() {
    return api.get('worker-test').json()
  },
  async getById(id) {
    return api.get(`worker-test/${id}`).json()
  },
  async create(data) {
    return api.post('worker-test', { json: data }).json()
  },
  async update(id, data) {
    return api.put(`worker-test/${id}`, { json: data }).json()
  },
  async delete(id) {
    return api.delete(`worker-test/${id}`).text()
  }
}

export default workerTestService
