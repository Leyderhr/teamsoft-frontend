import apiClient from './axios.js';

const authService = {
    // Login
    async login(credentials) {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Logout
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                await apiClient.post('/auth/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
        }
    },

    // Validar token
    async validateToken(token) {
        try {
            const response = await apiClient.get(`/auth/validate-token/${token}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Verificar si token es válido
    async checkTokenValidity() {
        const user = this.getCurrentUser();
        if (!user || !user.token) return false;

        try {
            await this.validateToken(user.token);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Obtener usuario actual
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            const user = JSON.parse(userStr);
            // Verificar si el token no ha expirado (si tenemos expiresIn)
            if (user.expiresAt && Date.now() > user.expiresAt) {
                this.logout();
                return null;
            }
            return user;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    // Verificar si está autenticado
    isAuthenticated() {
        const user = this.getCurrentUser();
        return !!(user && user.token);
    },

    // Obtener token
    getToken() {
        const user = this.getCurrentUser();
        return user ? user.token : null;
    }
};

export default authService;