import apiClient from '@/core/api/axios.js'

const ENDPOINT = '/project-structure-cycle'

const projectStructureCycleService = {
    async getAll() {
        try {
            return (await apiClient.get(ENDPOINT)).data
        } catch (error) {
            console.error('Error al obtener registros:', error)
            throw error
        }
    },
    async getById(id) {
        try {
            return (await apiClient.get(`${ENDPOINT}/${id}`)).data
        } catch (error) {
            console.error(`Error al obtener registro con ID ${id}:`, error)
            throw error
        }
    },
    async create(data) {
        try {
            return (await apiClient.post(ENDPOINT, data)).data
        } catch (error) {
            console.error('Error al crear registro:', error)
            throw error
        }
    },
    async update(id, data) {
        try {
            return (await apiClient.put(`${ENDPOINT}/${id}`, data)).data
        } catch (error) {
            console.error(`Error al actualizar registro con ID ${id}:`, error)
            throw error
        }
    },
    async delete(id) {
        try {
            return (await apiClient.delete(`${ENDPOINT}/${id}`)).data
        } catch (error) {
            console.error(`Error al eliminar registro con ID ${id}:`, error)
            throw error
        }
    }
}

export default projectStructureCycleService
