import { api } from '@/lib/api'

const competenceValueService = {
  async getAll() {
    return api.get('competence-value').json()
  },
  async getById(id) {
    return api.get(`competence-value/${id}`).json()
  },
  async create(data) {
    return api.post('competence-value', { json: data }).json()
  },
  async update(id, data) {
    return api.put(`competence-value/${id}`, { json: data }).json()
  },
  async delete(id) {
    return api.delete(`competence-value/${id}`).text()
  }
}

export default competenceValueService
