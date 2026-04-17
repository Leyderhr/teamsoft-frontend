import { defineStore } from 'pinia';
import authService from '@/core/api/authService.js';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(authService.getCurrentUser());

    const isAuthenticated = computed(() => !!user.value);
    
    // Getters directos en lugar de computed
    const username = computed(() => user.value?.username || '');
    const roles = computed(() => user.value?.authorities || []);
    const token = computed(() => user.value?.token || '');

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const expiresAt = Date.now() + (response.expiresIn || 1800000);

        user.value = {
            username: response.username,
            token: response.token || response.accessToken,
            type: response.type,
            authorities: response.authorities || [],
            expiresAt,
            lastLogin: new Date().toISOString()
        };

        localStorage.setItem('user', JSON.stringify(user.value));
        
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        return response;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            user.value = null;
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
        }
    };

    const refreshUser = () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            user.value = currentUser;
        }
    };

    const clearAuth = () => {
        user.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
    };

    const hasRole = (role) => {
        return user.value?.authorities?.includes(role) || false
    }

    const hasAnyRole = (rolesParam) => {
        if (!user.value?.authorities) return false
        const roleArray = Array.isArray(rolesParam) ? rolesParam : rolesParam.split(',').map(r => r.trim())
        return roleArray.some(role => user.value.authorities.includes(role))
    }

    return {
        user,
        isAuthenticated,
        username,
        roles,
        token,
        login,
        logout,
        refreshUser,
        clearAuth,
        hasRole,
        hasAnyRole
    }
})