import apiClient from '@/core/api/axios.js'

const ENDPOINT = '/users'

const userService = {
    async getAll() {
        const response = await apiClient.get(ENDPOINT)
        return response.data
    },

    async getById(id) {
        const response = await apiClient.get(`${ENDPOINT}/${id}`)
        return response.data
    },

    async create(user) {
        const response = await apiClient.post(ENDPOINT, user)
        return response.data
    },

    async delete(id) {
        const response = await apiClient.delete(`${ENDPOINT}/${id}`)
        return response.data
    },

    async resetPassword(id) {
        const response = await apiClient.post(`${ENDPOINT}/${id}/reset-password`)
        return response.data
    },

    async getRoles() {
        const response = await apiClient.get('/role')
        return response.data
    }
}

export default userService
