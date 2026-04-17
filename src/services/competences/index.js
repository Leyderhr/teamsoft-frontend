import { api } from '@/lib/api'

export async function fetchGetCompetences() {
  return api.get('competence').json()
}

export async function fetchGetCompetenceById(id) {
  return api.get(`competence/${id}`).json()
}

export async function fetchCreateCompetence(payload) {
  return api.post('competence', { json: payload }).json()
}

export async function fetchUpdateCompetence(id, payload) {
  return api.put(`competence/${id}`, { json: payload }).json()
}

export async function fetchDeleteCompetence(id) {
  return api.delete(`competence/${id}`).json()
}

export async function fetchImportCompetences(file, updateIfExist = false) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('updateIfExist', updateIfExist)
  
  return api.post('competence/import', { body: formData }).json()
}

export async function fetchExportCompetences() {
  return api.get('competence/export').blob()
}
