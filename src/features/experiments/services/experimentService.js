import apiClient from '@/core/api/axios.js'

const experimentService = {
    async getConfig() {
        try {
            return (await apiClient.get('/experiment/config')).data
        } catch (error) {
            console.error('Error al obtener configuración del experimento:', error)
            throw error
        }
    },
    async saveConfig(config) {
        try {
            return (await apiClient.put('/experiment/config', config)).data
        } catch (error) {
            console.error('Error al guardar configuración del experimento:', error)
            throw error
        }
    },
    async getMembersToEvaluate(projectId) {
        try {
            return (await apiClient.get(`/close-project/${projectId}/members`)).data
        } catch (error) {
            console.error('Error al obtener miembros del proyecto:', error)
            throw error
        }
    },
    async saveMemberEvaluation(projectId, memberId, evaluationData) {
        try {
            return (await apiClient.post(`/close-project/${projectId}/member/${memberId}/evaluate`, evaluationData)).data
        } catch (error) {
            console.error('Error al guardar evaluación del miembro:', error)
            throw error
        }
    },
    async finalizeProjectEvaluation(projectId) {
        try {
            return (await apiClient.post(`/close-project/${projectId}/finalize`)).data
        } catch (error) {
            console.error('Error al finalizar evaluación del proyecto:', error)
            throw error
        }
    }
}

export default experimentService
