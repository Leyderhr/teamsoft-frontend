import apiClient from '../../../core/api/axios.js'

const ENDPOINT = '/project'

const projectService = {
    async getAll() {
        const response = await apiClient.get(ENDPOINT)
        return response.data
    },

    async getById(id) {
        const response = await apiClient.get(`${ENDPOINT}/${id}`)
        return response.data
    },

    async create(project) {
        // Si ya es un array, enviarlo directamente; si no, envolverlo
        const data = Array.isArray(project) ? project : [project]
        const response = await apiClient.post(ENDPOINT, data)
        return response.data
    },

    async update(id, project) {
        const response = await apiClient.put(`${ENDPOINT}/${id}`, project)
        return response.data
    },

    async delete(id) {
        const response = await apiClient.delete(`${ENDPOINT}/${id}`)
        return response.data
    },

    async close(id) {
        const response = await apiClient.put(`${ENDPOINT}/close/${id}`)
        return response.data
    }
}

export default projectService
