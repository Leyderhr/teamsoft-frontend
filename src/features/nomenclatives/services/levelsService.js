import apiClient from '../../../core/api/axios.js'

const ENDPOINT = '/levels'

const levelsService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener niveles:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener nivel con ID ${id}:`, error)
            throw error
        }
    },

    async create(level) {
        try {
            const response = await apiClient.post(ENDPOINT, level)
            return response.data
        } catch (error) {
            console.error('Error al crear nivel:', error)
            throw error
        }
    },

    async update(id, level) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, level)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar nivel con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar nivel con ID ${id}:`, error)
            throw error
        }
    }
}

export default levelsService
