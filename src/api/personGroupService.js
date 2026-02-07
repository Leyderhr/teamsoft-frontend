import apiClient from './axios'

const ENDPOINT = '/personGroups'

const personGroupService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener grupos de personas:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener grupo de persona con ID ${id}:`, error)
            throw error
        }
    },

    async create(personGroup) {
        try {
            const response = await apiClient.post(ENDPOINT, personGroup)
            return response.data
        } catch (error) {
            console.error('Error al crear grupo de persona:', error)
            throw error
        }
    },

    async update(id, personGroup) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, personGroup)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar grupo de persona con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar grupo de persona con ID ${id}:`, error)
            throw error
        }
    }
}

export default personGroupService
