import { api } from '@/lib/api'

const reportService = {
  async getPersonReport() {
    return api.get('person/report').json()
  },
  async getFinishedProjects() {
    return api.get('project/finished').json()
  },
  async getFinishedTeamByProject(projectId) {
    return api.get(`assigned-role/project/${projectId}`).json()
  },
  async getFilteredWorkers(filters) {
    return api.post('person/filter', { json: filters }).json()
  },
  async getPersonProjects(personId) {
    return api.get(`assigned-role/person/${personId}/projects`).json()
  },
  async getPersonRolesInProject(personId, projectId) {
    return api.get(`assigned-role/person/${personId}/project/${projectId}`).json()
  }
}

export default reportService
