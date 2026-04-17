import { api } from '@/lib/api'

const roleCompetitionService = {
  async getAll() {
    return api.get('role-competition').json()
  },
  async getById(id) {
    return api.get(`role-competition/${id}`).json()
  },
  async create(data) {
    return api.post('role-competition', { json: data }).json()
  },
  async update(id, data) {
    return api.put(`role-competition/${id}`, { json: data }).json()
  },
  async delete(id) {
    return api.delete(`role-competition/${id}`).text()
  }
}

export default roleCompetitionService
