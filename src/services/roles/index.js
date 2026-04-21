import { api } from '@/lib/api'

export async function fetchGetRoles() {
  return api.get('role').json()
}

export async function fetchGetRoleById(id) {
  return api.get(`role/${id}`).json()
}

export async function fetchCreateRole(payload) {
  return api.post('role', { json: payload }).json()
}

export async function fetchUpdateRole(id, payload) {
  return api.put(`role/${id}`, { json: payload }).json()
}

export async function fetchDeleteRole(id) {
  return api.delete(`role/${id}`).json()
}

export async function fetchImportRoles(file, updateIfExist = false) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('updateIfExist', updateIfExist)
  
  return api.post('role/import', { body: formData }).json()
}

export async function fetchExportRoles() {
  return api.get('role/export').blob()
}
