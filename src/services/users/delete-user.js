import { api } from '@/lib/api'

/**
 * Eliminar un usuario
 * @param {number} id
 * @returns {Promise<{message: string}>}
 */
export async function fetchDeleteUser(id) {
  return api.delete(`users/${id}`).json()
}
