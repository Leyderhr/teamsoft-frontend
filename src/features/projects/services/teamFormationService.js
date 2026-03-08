import apiClient from '@/core/api/axios.js'

const ENDPOINT = '/teamFormation'

export default {
    /**
     * Genera una propuesta de equipos usando algoritmos metaheurísticos.
     * @param {Object} payload - { teamFormationParameters, projectsIDs, groupIDs }
     * @returns {Promise<{ formattedEval: string, projectsProposal: Array }>}
     */
    generateTeams(payload) {
        return apiClient.post(`${ENDPOINT}/teams`, payload).then(res => res.data)
    },

    /**
     * Guarda la propuesta de equipos generada en la base de datos.
     * @param {Object} payload - La misma propuesta devuelta por generateTeams
     * @returns {Promise<{ message: string, assignedRolesCount: number, projectsUpdated: number }>}
     */
    saveTeams(payload) {
        return apiClient.post(`${ENDPOINT}/save_teams`, payload).then(res => res.data)
    }
}
