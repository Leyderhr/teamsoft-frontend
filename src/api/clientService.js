import apiClient from './axios'

const ENDPOINT = '/clients'

const clientService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener clientes:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al obtener cliente con ID ${id}:`, error)
            throw error
        }
    },

    async create(client) {
        try {
            const response = await apiClient.post(ENDPOINT, client)
            return response.data
        } catch (error) {
            console.error('Error al crear cliente:', error)
            throw error
        }
    },

    async update(id, client) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, client)
            return response.data
        } catch (error) {
            console.error(`Error al actualizar cliente con ID ${id}:`, error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error al eliminar cliente con ID ${id}:`, error)
            throw error
        }
    }
}

export default clientService
