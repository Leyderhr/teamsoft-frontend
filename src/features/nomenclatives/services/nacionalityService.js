import apiClient from '../../../core/api/axios.js'

const ENDPOINT = '/nacionality'

const nacionalityService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener nacionalidades:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener nacionalidad con ID ${id}:`, error)
            throw error
        }
    },

    async create(nacionality) {
        try {
            const response = await apiClient.post(ENDPOINT, nacionality)
            return response.data
        } catch (error) {
            console.error('Error al crear nacionalidad:', error)
            throw error
        }
    },

    async update(id, nacionality) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, nacionality)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar nacionalidad con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar nacionalidad con ID ${id}:`, error)
            throw error
        }
    }
}

export default nacionalityService
