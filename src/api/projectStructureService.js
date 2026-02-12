import apiClient from './axios'

const ENDPOINT = '/project-structure'

const projectStructureService = {
    async getAll() {
        try {
            const response = await apiClient.get(ENDPOINT)
            return response.data
        } catch (error) {
            console.error('Error al obtener estructuras de proyecto:', error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error('Error al obtener estructura de proyecto con ID ${id}:', error)
            throw error
        }
    },

    async create(projectStructure) {
        try {
            const response = await apiClient.post(ENDPOINT, projectStructure)
            return response.data
        } catch (error) {
            console.error('Error al crear estructura de proyecto:', error)
            throw error
        }
    },

    async update(id, projectStructure) {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, projectStructure)
            return response.data
        } catch (error) {
            console.error('Error al actualizar estructura de proyecto con ID ${id}:', error)
            throw error
        }
    },

    async delete(id) {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`)
            return response.data
        } catch (error) {
            console.error('Error al eliminar estructura de proyecto con ID ${id}:', error)
            throw error
        }
    }
}

export default projectStructureService
