import { api } from '@/lib/api'

const userRoleService = {
  async getAllRoles() {
    return api.get('user-roles').json()
  }
}

export default userRoleService
