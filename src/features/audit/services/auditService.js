import apiClient from '@/core/api/axios.js'

const ENDPOINT = '/traza'

const auditService = {
    async getAll() {
        try {
            return (await apiClient.get(ENDPOINT)).data
        } catch (error) {
            console.error('Error al obtener trazas del sistema:', error)
            throw error
        }
    },
    async getGeneralActions() {
        try {
            return (await apiClient.get(`${ENDPOINT}/general`)).data
        } catch (error) {
            console.error('Error al obtener acciones generales:', error)
            throw error
        }
    },
    async getCloseActions() {
        try {
            return (await apiClient.get(`${ENDPOINT}/close`)).data
        } catch (error) {
            console.error('Error al obtener trazas de cierre:', error)
            throw error
        }
    },
    async getCancelActions() {
        try {
            return (await apiClient.get(`${ENDPOINT}/cancel`)).data
        } catch (error) {
            console.error('Error al obtener trazas de cancelación:', error)
            throw error
        }
    },
    async getIOActions() {
        try {
            return (await apiClient.get(`${ENDPOINT}/io`)).data
        } catch (error) {
            console.error('Error al obtener trazas de importación/exportación:', error)
            throw error
        }
    }
}

export default auditService
