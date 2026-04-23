import { api } from '@/lib/api'

/**
 * @typedef {Object} LoginCredentials
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {string} refreshToken
 * @property {string} type
 * @property {string} username
 * @property {string[]} authorities
 * @property {number} expiresIn
 */

/**
 * Login de usuario
 * @param {LoginCredentials} credentials
 * @returns {Promise<LoginResponse>}
 */
export async function login(credentials) {
  return api.post('auth/login', { json: credentials }).json()
}
