import { api } from '@/lib/api'

/**
 * Logout de usuario
 * @returns {Promise<{message: string}>}
 */
export async function logout() {
  return api.post('auth/logout').json()
}
