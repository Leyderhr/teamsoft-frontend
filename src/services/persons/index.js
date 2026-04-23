import { api } from '@/lib/api'

export async function fetchGetPersons() {
  return api.get('person').json()
}

export async function fetchGetPersonById(id) {
  return api.get(`person/${id}`).json()
}

export async function fetchCreatePerson(payload) {
  return api.post('person', { json: payload }).json()
}

export async function fetchUpdatePerson(id, payload) {
  return api.put(`person/${id}`, { json: payload }).json()
}

export async function fetchDeletePerson(id) {
  return api.delete(`person/${id}`).text()
}
