import { api } from '@/lib/api'

const userService = {
  async getAll() {
    return api.get('users').json()
  },
  async getById(id) {
    return api.get(`users/${id}`).json()
  },
  async create(user) {
    return api.post('users', { json: user }).json()
  },
  async update(id, user) {
    return api.put(`users/${id}`, { json: user }).json()
  },
  async delete(id) {
    return api.delete(`users/${id}`).json()
  },
  async resetPassword(id) {
    return api.post(`users/${id}/reset-password`).json()
  },
  async getRoles() {
    return api.get('role').json()
  }
}

export default userService
