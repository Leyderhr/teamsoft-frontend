import { api } from '@/lib/api'
const roleEvaluationService = {
  async getAll() { return api.get('roleEvaluation').json() },
  async getById(id) { return api.get(`roleEvaluation/${id}`).json() },
  async create(data) { return api.post('roleEvaluation', { json: data }).json() },
  async update(id, data) { return api.put(`roleEvaluation/${id}`, { json: data }).json() },
  async delete(id) { return api.delete(`roleEvaluation/${id}`).text() }
}
export default roleEvaluationService
