import apiClient from '@/core/api/axios.js'

const ENDPOINT = '/user'

const userService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener usuarios:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener usuario con ID ${id}:`, error)
            throw error
        }
    },

    async create(user) {
        try {
            const response = await apiClient.post(ENDPOINT, user)
            return response.data
        } catch (error) {
            console.error('Error al crear usuario:', error)
            throw error
        }
    },

    async update(id, user) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, user)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar usuario con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar usuario con ID ${id}:`, error)
            throw error
        }
    }
}

export default userService
