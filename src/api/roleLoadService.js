import apiClient from './axios'

const ENDPOINT = '/roleLoad'

const roleLoadService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener cargas de rol:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener carga de rol con ID ${id}:`, error)
            throw error
        }
    },

    async create(roleLoad) {
        try {
            const response = await apiClient.post(ENDPOINT, roleLoad)
            return response.data
        } catch (error) {
            console.error('Error al crear carga de rol:', error)
            throw error
        }
    },

    async update(id, roleLoad) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, roleLoad)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar carga de rol con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar carga de rol con ID ${id}:`, error)
            throw error
        }
    }
}

export default roleLoadService
