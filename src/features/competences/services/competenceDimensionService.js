import { api } from '@/lib/api'

const competenceDimensionService = {
  async getAll() {
    return api.get('competence-dimension').json()
  },
  async getById(id) {
    return api.get(`competence-dimension/${id}`).json()
  },
  async create(data) {
    return api.post('competence-dimension', { json: data }).json()
  },
  async update(id, data) {
    return api.put(`competence-dimension/${id}`, { json: data }).json()
  },
  async delete(id) {
    return api.delete(`competence-dimension/${id}`).text()
  }
}

export default competenceDimensionService
