import { api } from '@/lib/api'

/**
 * Actualizar un usuario
 * @param {number} id
 * @param {import('./types').UpdateUserPayload} payload
 * @returns {Promise<import('./types').User>}
 */
export async function fetchUpdateUser(id, payload) {
  return api.put(`users/${id}`, { json: payload }).json()
}
