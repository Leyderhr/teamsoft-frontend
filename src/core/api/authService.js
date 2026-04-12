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

    // Refresh token
    async refreshToken(refreshToken) {
        try {
            const response = await apiClient.post('/auth/refresh', null, {
                headers: {
                    Authorization: `Bearer ${refreshToken}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Logout
    async logout() {
        try {
            const user = this.getCurrentUser();
            if (user?.token && user?.refreshToken) {
                await apiClient.post('/auth/logout', 
                    { refreshToken: user.refreshToken },
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
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
            // Verificar si el token no ha expirado
            if (user.expiresAt && Date.now() > user.expiresAt) {
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
    },

    // Obtener refresh token
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    },

    // Verificar si el token está por expirar (menos de 5 minutos)
    isTokenExpiringSoon() {
        const user = this.getCurrentUser();
        if (!user || !user.expiresAt) return false;
        
        const fiveMinutes = 5 * 60 * 1000;
        return (user.expiresAt - Date.now()) < fiveMinutes;
    }
};

export default authService;