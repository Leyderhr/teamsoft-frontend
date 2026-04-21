import { api } from '@/lib/api'

/**
 * Obtener todos los usuarios
 * @returns {Promise<import('./types').User[]>}
 */
export async function fetchGetUsers() {
  return api.get('users').json()
}
