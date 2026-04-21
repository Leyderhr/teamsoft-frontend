import { api } from '@/lib/api'

const roleService = {
  async getAll() {
    return api.get('role').json()
  },
  async getById(id) {
    return api.get(`role/${id}`).json()
  },
  async create(role) {
    return api.post('role', { json: role }).json()
  },
  async update(id, role) {
    return api.put(`role/${id}`, { json: role }).json()
  },
  async delete(id) {
    return api.delete(`role/${id}`).text()
  },
  async importFile(file, updateIfExist = false) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('updateIfExist', updateIfExist)
    return api.post('role/import', { body: formData }).json()
  },
  async exportFile() {
    return api.get('role/export').blob()
  }
}

export default roleService
