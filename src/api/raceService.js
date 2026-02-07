import apiClient from './axios'

const ENDPOINT = '/race'

const raceService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener razas:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener raza con ID ${id}:`, error)
            throw error
        }
    },

    async create(race) {
        try {
            const response = await apiClient.post(ENDPOINT, race)
            return response.data
        } catch (error) {
            console.error('Error al crear raza:', error)
            throw error
        }
    },

    async update(id, race) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, race)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar raza con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar raza con ID ${id}:`, error)
            throw error
        }
    }
}

export default raceService
