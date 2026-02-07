import apiClient from './axios'

const ENDPOINT = '/costDistance'

const costDistanceService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener costos de distancia:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener costo de distancia con ID ${id}:`, error)
            throw error
        }
    },

    async create(costDistance) {
        try {
            const response = await apiClient.post(ENDPOINT, costDistance)
            return response.data
        } catch (error) {
            console.error('Error al crear costo de distancia:', error)
            throw error
        }
    },

    async update(id, costDistance) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, costDistance)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar costo de distancia con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar costo de distancia con ID ${id}:`, error)
            throw error
        }
    }
}

export default costDistanceService
