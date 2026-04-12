import apiClient from '@/core/api/axios.js'

const importService = {
    // Upload CSV file and get column headers + preview rows
    async uploadFile(file) {
        try {
            const formData = new FormData()
            formData.append('file', file)
            return (await apiClient.post('/import/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })).data
        } catch (error) {
            console.error('Error al subir el archivo:', error)
            throw error
        }
    },

    // Execute the import with all mappings and config
    async executeImport(payload) {
        try {
            return (await apiClient.post('/import/execute', payload)).data
        } catch (error) {
            console.error('Error al ejecutar la importación:', error)
            throw error
        }
    },

    // Get import configuration (cut-off, years experience, etc.)
    async getConfig() {
        try {
            return (await apiClient.get('/import/config')).data
        } catch (error) {
            console.error('Error al obtener configuración de importación:', error)
            throw error
        }
    },

    // Save import configuration
    async saveConfig(config) {
        try {
            return (await apiClient.put('/import/config', config)).data
        } catch (error) {
            console.error('Error al guardar configuración de importación:', error)
            throw error
        }
    }
}

export default importService
