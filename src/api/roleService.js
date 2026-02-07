import apiClient from './axios'

const ENDPOINT = '/role'

const roleService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener roles:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener rol con ID ${id}:`, error)
            throw error
        }
    },

    async create(role) {
        try {
            const response = await apiClient.post(ENDPOINT, role)
            return response.data
        } catch (error) {
            console.error('Error al crear rol:', error)
            throw error
        }
    },

    async update(id, role) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, role)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar rol con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar rol con ID ${id}:`, error)
            throw error
        }
    }
}

export default roleService
