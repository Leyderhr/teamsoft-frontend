import { api } from '@/lib/api'

export default {
  generateTeams(payload) {
    return api.post('teamFormation/teams', { json: payload }).json()
  },
  saveTeams(payload) {
    return api.post('teamFormation/save_teams', { json: payload }).json()
  }
}
