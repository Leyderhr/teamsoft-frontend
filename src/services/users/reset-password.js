import { api } from '@/lib/api'

/**
 * Resetear contraseña de un usuario a valor por defecto
 * @param {number} id
 * @returns {Promise<{message: string}>}
 */
export async function fetchResetPassword(id) {
  return api.post(`users/${id}/reset-password`).json()
}
