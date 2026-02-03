import apiClient from './axios'

const ENDPOINT = '/religion'

const religionService = {
  async getAll() {
    try {
      const response = await apiClient.get(ENDPOINT)
      return response.data
    } catch (error) {
      console.error('Error al obtener religiones:', error)
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`${ENDPOINT}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener religión con ID ${id}:`, error)
      throw error
    }
  },

  async create(religion) {
    try {
      const response = await apiClient.post(ENDPOINT, religion)
      return response.data
    } catch (error) {
      console.error('Error al crear religión:', error)
      throw error
    }
  },

  async update(id, religion) {
    try {
      const response = await apiClient.put(`${ENDPOINT}/${id}`, religion)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar religión con ID ${id}:`, error)
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await apiClient.delete(`${ENDPOINT}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar religión con ID ${id}:`, error)
      throw error
    }
  }
}

export default religionService
