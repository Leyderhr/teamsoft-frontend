import apiClient from '../../../core/api/axios.js'

const ENDPOINT = '/competence'

const competenceService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener competencias:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener competencia con ID ${id}:`, error)
            throw error
        }
    },

    async create(competence) {
        try {
            const response = await apiClient.post(ENDPOINT, competence)
            return response.data
        } catch (error) {
            console.error('Error al crear competencia:', error)
            throw error
        }
    },

    async update(id, competence) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, competence)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar competencia con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar competencia con ID ${id}:`, error)
            throw error
        }
    }
}

export default competenceService
