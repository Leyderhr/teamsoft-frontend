import { api } from '@/lib/api'

/**
 * Obtener usuario por ID
 * @param {number} id
 * @returns {Promise<import('./types').User>}
 */
export async function fetchGetUserById(id) {
  return api.get(`users/${id}`).json()
}
