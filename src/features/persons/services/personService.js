import { api } from '@/lib/api'

const personService = {
  async getAll() {
    return api.get('person').json()
  },
  async getById(id) {
    return api.get(`person/${id}`).json()
  },
  async create(person) {
    return api.post('person', { json: person }).json()
  },
  async update(id, person) {
    return api.put(`person/${id}`, { json: person }).json()
  },
  async delete(id) {
    return api.delete(`person/${id}`).text()
  }
}

export default personService
