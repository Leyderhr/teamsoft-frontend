import apiClient from '@/core/api/axios.js'

const reportService = {
    // Reporte de Personas - lista completa de trabajadores con datos extendidos
    async getPersonReport() {
        try {
            return (await apiClient.get('/person/report')).data
        } catch (error) {
            console.error('Error al obtener reporte de personas:', error)
            throw error
        }
    },

    // Proyectos finalizados
    async getFinishedProjects() {
        try {
            return (await apiClient.get('/project/finished')).data
        } catch (error) {
            console.error('Error al obtener proyectos finalizados:', error)
            throw error
        }
    },

    // Miembros del equipo de un proyecto finalizado (por ciclo)
    async getFinishedTeamByProject(projectId) {
        try {
            return (await apiClient.get(`/assigned-role/project/${projectId}`)).data
        } catch (error) {
            console.error(`Error al obtener equipo del proyecto ${projectId}:`, error)
            throw error
        }
    },

    // Listar personas con filtros (roles, proyectos, competencias, MBTI, Belbin)
    async getFilteredWorkers(filters) {
        try {
            return (await apiClient.post('/person/filter', filters)).data
        } catch (error) {
            console.error('Error al filtrar trabajadores:', error)
            throw error
        }
    },

    // Proyectos del trabajador para el reporte de persona
    async getPersonProjects(personId) {
        try {
            return (await apiClient.get(`/assigned-role/person/${personId}/projects`)).data
        } catch (error) {
            console.error(`Error al obtener proyectos del trabajador ${personId}:`, error)
            throw error
        }
    },

    // Roles asignados al trabajador en un proyecto específico
    async getPersonRolesInProject(personId, projectId) {
        try {
            return (await apiClient.get(`/assigned-role/person/${personId}/project/${projectId}`)).data
        } catch (error) {
            console.error(`Error al obtener roles del trabajador en el proyecto:`, error)
            throw error
        }
    }
}

export default reportService
