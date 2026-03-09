import apiClient from '@/core/api/axios.js'

const changePasswordService = {
    async changePassword(payload) {
        try {
            const response = await apiClient.put('/auth/change-password', payload)
            return response.data
        } catch (error) {
            console.error('Error al cambiar contraseña:', error)
            throw error
        }
    }
}

export default changePasswordService
