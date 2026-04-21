import { api } from '@/lib/api'

/**
 * Crear un nuevo usuario
 * @param {import('./types').CreateUserPayload} payload
 * @returns {Promise<import('./types').User>}
 */
export async function fetchCreateUser(payload) {
  return api.post('users', { json: payload }).json()
}
