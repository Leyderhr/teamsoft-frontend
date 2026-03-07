import apiClient from '../../../core/api/axios.js'

const ENDPOINT = '/person'

const personService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener personas:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener persona con ID ${id}:`, error)
            throw error
        }
    },

    async create(person) {
        try {
            const response = await apiClient.post(ENDPOINT, person)
            return response.data
        } catch (error) {
            console.error('Error al crear persona:', error)
            throw error
        }
    },

    async update(id, person) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, person)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar persona con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar persona con ID ${id}:`, error)
            throw error
        }
    }
}

export default personService
