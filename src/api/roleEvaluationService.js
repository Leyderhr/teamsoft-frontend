import apiClient from './axios'

const ENDPOINT = '/roleEvaluation'

const roleEvaluationService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener evaluaciones de rol:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener evaluación de rol con ID ${id}:`, error)
            throw error
        }
    },

    async create(roleEvaluation) {
        try {
            const response = await apiClient.post(ENDPOINT, roleEvaluation)
            return response.data
        } catch (error) {
            console.error('Error al crear evaluación de rol:', error)
            throw error
        }
    },

    async update(id, roleEvaluation) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, roleEvaluation)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar evaluación de rol con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar evaluación de rol con ID ${id}:`, error)
            throw error
        }
    }
}

export default roleEvaluationService
