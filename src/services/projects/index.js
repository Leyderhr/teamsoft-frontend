import { api } from '@/lib/api'

export async function fetchGetProjects() {
  return api.get('project').json()
}

export async function fetchGetProjectById(id) {
  return api.get(`project/${id}`).json()
}

export async function fetchCreateProjects(payload) {
  return api.post('project', { json: payload }).json()
}

export async function fetchUpdateProject(id, payload) {
  return api.put(`project/${id}`, { json: payload }).json()
}

export async function fetchCloseProject(id) {
  return api.put(`project/close/${id}`).json()
}

export async function fetchDeleteProject(id) {
  return api.delete(`project/${id}`).json()
}
