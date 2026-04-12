import apiClient from '../../../core/api/axios.js'

const ENDPOINT = '/conflictIndex'

const conflictIndexService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener índices de conflicto:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener índice de conflicto con ID ${id}:`, error)
            throw error
        }
    },

    async create(conflictIndex) {
        try {
            const response = await apiClient.post(ENDPOINT, conflictIndex)
            return response.data
        } catch (error) {
            console.error('Error al crear índice de conflicto:', error)
            throw error
        }
    },

    async update(id, conflictIndex) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, conflictIndex)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar índice de conflicto con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar índice de conflicto con ID ${id}:`, error)
            throw error
        }
    }
}

export default conflictIndexService
