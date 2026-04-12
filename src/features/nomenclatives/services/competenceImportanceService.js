import apiClient from '../../../core/api/axios.js'

const ENDPOINT = '/competenceImportance'

const competenceImportanceService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener importancias de competencia:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener importancia de competencia con ID ${id}:`, error)
            throw error
        }
    },

    async create(competenceImportance) {
        try {
            const response = await apiClient.post(ENDPOINT, competenceImportance)
            return response.data
        } catch (error) {
            console.error('Error al crear importancia de competencia:', error)
            throw error
        }
    },

    async update(id, competenceImportance) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, competenceImportance)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar importancia de competencia con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar importancia de competencia con ID ${id}:`, error)
            throw error
        }
    }
}

export default competenceImportanceService
