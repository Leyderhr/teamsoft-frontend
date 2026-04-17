import { api } from '@/lib/api'

export async function fetchGetPersons() {
  console.log('fetchGetPersons called')
  console.log('API base URL:', import.meta.env.VITE_API_BASE_URL)
  try {
    const result = await api.get('person').json()
    console.log('fetchGetPersons success:', result)
    return result
  } catch (error) {
    console.error('fetchGetPersons error:', error)
    throw error
  }
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
  return api.delete(`person/${id}`).json()
}
