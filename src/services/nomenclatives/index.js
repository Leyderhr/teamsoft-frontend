import { api } from '@/lib/api'

// Clients
export async function fetchGetClients() {
  return api.get('clients').json()
}

export async function fetchCreateClient(payload) {
  return api.post('clients', { json: payload }).json()
}

export async function fetchUpdateClient(id, payload) {
  return api.put(`clients/${id}`, { json: payload }).json()
}

export async function fetchDeleteClient(id) {
  return api.delete(`clients/${id}`).json()
}

// Age Groups
export async function fetchGetAgeGroups() {
  return api.get('ageGroups').json()
}

export async function fetchCreateAgeGroup(payload) {
  return api.post('ageGroups', { json: payload }).json()
}

export async function fetchUpdateAgeGroup(id, payload) {
  return api.put(`ageGroups/${id}`, { json: payload }).json()
}

export async function fetchDeleteAgeGroup(id) {
  return api.delete(`ageGroups/${id}`).json()
}

// Competence Importance
export async function fetchGetCompetenceImportance() {
  return api.get('competenceImportance').json()
}

export async function fetchCreateCompetenceImportance(payload) {
  return api.post('competenceImportance', { json: payload }).json()
}

export async function fetchUpdateCompetenceImportance(id, payload) {
  return api.put(`competenceImportance/${id}`, { json: payload }).json()
}

export async function fetchDeleteCompetenceImportance(id) {
  return api.delete(`competenceImportance/${id}`).json()
}

// Conflict Index
export async function fetchGetConflictIndex() {
  return api.get('conflictIndex').json()
}

export async function fetchCreateConflictIndex(payload) {
  return api.post('conflictIndex', { json: payload }).json()
}

export async function fetchUpdateConflictIndex(id, payload) {
  return api.put(`conflictIndex/${id}`, { json: payload }).json()
}

export async function fetchDeleteConflictIndex(id) {
  return api.delete(`conflictIndex/${id}`).json()
}

// Cost Distance
export async function fetchGetCostDistance() {
  return api.get('costDistance').json()
}

export async function fetchCreateCostDistance(payload) {
  return api.post('costDistance', { json: payload }).json()
}

export async function fetchUpdateCostDistance(id, payload) {
  return api.put(`costDistance/${id}`, { json: payload }).json()
}

export async function fetchDeleteCostDistance(id) {
  return api.delete(`costDistance/${id}`).json()
}

// County
export async function fetchGetCounties() {
  return api.get('county').json()
}

export async function fetchCreateCounty(payload) {
  return api.post('county', { json: payload }).json()
}

export async function fetchUpdateCounty(id, payload) {
  return api.put(`county/${id}`, { json: payload }).json()
}

export async function fetchDeleteCounty(id) {
  return api.delete(`county/${id}`).json()
}

// Levels
export async function fetchGetLevels() {
  return api.get('levels').json()
}

export async function fetchCreateLevel(payload) {
  return api.post('levels', { json: payload }).json()
}

export async function fetchUpdateLevel(id, payload) {
  return api.put(`levels/${id}`, { json: payload }).json()
}

export async function fetchDeleteLevel(id) {
  return api.delete(`levels/${id}`).json()
}

// Nacionality
export async function fetchGetNacionalities() {
  return api.get('nacionality').json()
}

export async function fetchCreateNacionality(payload) {
  return api.post('nacionality', { json: payload }).json()
}

export async function fetchUpdateNacionality(id, payload) {
  return api.put(`nacionality/${id}`, { json: payload }).json()
}

export async function fetchDeleteNacionality(id) {
  return api.delete(`nacionality/${id}`).json()
}

// Person Groups
export async function fetchGetPersonGroups() {
  return api.get('personGroups').json()
}

export async function fetchCreatePersonGroup(payload) {
  return api.post('personGroups', { json: payload }).json()
}

export async function fetchUpdatePersonGroup(id, payload) {
  return api.put(`personGroups/${id}`, { json: payload }).json()
}

export async function fetchDeletePersonGroup(id) {
  return api.delete(`personGroups/${id}`).json()
}

// Project Structure
export async function fetchGetProjectStructures() {
  return api.get('project-structure').json()
}

export async function fetchCreateProjectStructure(payload) {
  return api.post('project-structure', { json: payload }).json()
}

export async function fetchUpdateProjectStructure(id, payload) {
  return api.put(`project-structure/${id}`, { json: payload }).json()
}

export async function fetchDeleteProjectStructure(id) {
  return api.delete(`project-structure/${id}`).json()
}

// Race
export async function fetchGetRaces() {
  return api.get('race').json()
}

export async function fetchCreateRace(payload) {
  return api.post('race', { json: payload }).json()
}

export async function fetchUpdateRace(id, payload) {
  return api.put(`race/${id}`, { json: payload }).json()
}

export async function fetchDeleteRace(id) {
  return api.delete(`race/${id}`).json()
}

// Religion
export async function fetchGetReligions() {
  return api.get('religion').json()
}

export async function fetchCreateReligion(payload) {
  return api.post('religion', { json: payload }).json()
}

export async function fetchUpdateReligion(id, payload) {
  return api.put(`religion/${id}`, { json: payload }).json()
}

export async function fetchDeleteReligion(id) {
  return api.delete(`religion/${id}`).json()
}

// Role Evaluation
export async function fetchGetRoleEvaluations() {
  return api.get('roleEvaluation').json()
}

export async function fetchCreateRoleEvaluation(payload) {
  return api.post('roleEvaluation', { json: payload }).json()
}

export async function fetchUpdateRoleEvaluation(id, payload) {
  return api.put(`roleEvaluation/${id}`, { json: payload }).json()
}

export async function fetchDeleteRoleEvaluation(id) {
  return api.delete(`roleEvaluation/${id}`).json()
}

// Role Load
export async function fetchGetRoleLoads() {
  return api.get('roleLoad').json()
}

export async function fetchCreateRoleLoad(payload) {
  return api.post('roleLoad', { json: payload }).json()
}

export async function fetchUpdateRoleLoad(id, payload) {
  return api.put(`roleLoad/${id}`, { json: payload }).json()
}

export async function fetchDeleteRoleLoad(id) {
  return api.delete(`roleLoad/${id}`).json()
}
