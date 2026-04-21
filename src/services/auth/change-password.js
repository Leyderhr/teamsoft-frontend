import { api } from '@/lib/api'

/**
 * @typedef {Object} ChangePasswordData
 * @property {string} currentPassword
 * @property {string} newPassword
 * @property {string} confirmPassword
 */

/**
 * Cambiar contraseña del usuario actual
 * @param {ChangePasswordData} data
 * @returns {Promise<void>}
 */
export async function changePassword(data) {
  return api.post('auth/change-password', { json: data }).json()
}
