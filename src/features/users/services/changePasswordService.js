import { api } from '@/lib/api'

const changePasswordService = {
  async changePassword(payload) {
    return api.post('auth/change-password', { json: payload }).json()
  }
}

export default changePasswordService
