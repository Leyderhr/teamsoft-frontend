import apiClient from './axios'

const ENDPOINT = '/ageGroups'

const ageGroupService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener grupos de edad:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener grupo de edad con ID ${id}:`, error)
            throw error
        }
    },

    async create(ageGroup) {
        try {
            const response = await apiClient.post(ENDPOINT, ageGroup)
            return response.data
        } catch (error) {
            console.error('Error al crear grupo de edad:', error)
            throw error
        }
    },

    async update(id, ageGroup) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, ageGroup)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar grupo de edad con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar grupo de edad con ID ${id}:`, error)
            throw error
        }
    }
}

export default ageGroupService
