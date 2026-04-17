import { api } from '@/lib/api'

const competenceService = {
  async getAll() {
    return api.get('competence').json()
  },
  async getById(id) {
    return api.get(`competence/${id}`).json()
  },
  async create(competence) {
    return api.post('competence', { json: competence }).json()
  },
  async update(id, competence) {
    return api.put(`competence/${id}`, { json: competence }).json()
  },
  async delete(id) {
    return api.delete(`competence/${id}`).text()
  },
  async importFile(file, updateIfExist = false) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('updateIfExist', updateIfExist)
    return api.post('competence/import', { body: formData }).json()
  },
  async exportFile() {
    return api.get('competence/export').blob()
  }
}

export default competenceService
