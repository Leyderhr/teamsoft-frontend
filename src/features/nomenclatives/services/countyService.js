import apiClient from '../../../core/api/axios.js'

const ENDPOINT = '/county'

const countyService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener provincias:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener provincia con ID ${id}:`, error)
            throw error
        }
    },

    async create(county) {
        try {
            const response = await apiClient.post(ENDPOINT, county)
            return response.data
        } catch (error) {
            console.error('Error al crear provincia:', error)
            throw error
        }
    },

    async update(id, county) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, county)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar provincia con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar provincia con ID ${id}:`, error)
            throw error
        }
    }
}

export default countyService
