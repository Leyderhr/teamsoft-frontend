import { api } from '@/lib/api'
const competenceImportanceService = {
  async getAll() { return api.get('competenceImportance').json() },
  async getById(id) { return api.get(`competenceImportance/${id}`).json() },
  async create(data) { return api.post('competenceImportance', { json: data }).json() },
  async update(id, data) { return api.put(`competenceImportance/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`competenceImportance/${id}`).text() }
}
export default competenceImportanceService
