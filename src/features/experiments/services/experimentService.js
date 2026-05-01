import { api } from '@/lib/api'

const experimentService = {
  async saveConfig(config) {
    return api.put('algorithm', { json: config }).json()
  },
  async getMembersToEvaluate(projectId) {
    return api.get(`close-project/${projectId}/members`).json()
  },
  async saveMemberEvaluation(projectId, memberId, evaluationData) {
    return api.post(`close-project/${projectId}/member/${memberId}/evaluate`, { json: evaluationData }).json()
  },
  async finalizeProjectEvaluation(projectId) {
    return api.post(`close-project/${projectId}/finalize`).json()
  }
}

export default experimentService
