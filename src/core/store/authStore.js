import { defineStore } from 'pinia';
import authService from '@/core/api/authService.js';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(authService.getCurrentUser());

    const isAuthenticated = computed(() => !!user.value);
    const username = computed(() => user.value?.username || '');
    const roles = computed(() => user.value?.authorities || []);
    const token = computed(() => user.value?.token || '');

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const expiresAt = Date.now() + (response.expiresIn || 1800000);

        user.value = {
            username: response.username,
            token: response.token,
            type: response.type,
            authorities: response.authorities,
            expiresAt,
            lastLogin: new Date().toISOString()
        };

        localStorage.setItem('user', JSON.stringify(user.value));
        return response;
    };

    const logout = async () => {
        await authService.logout();
        user.value = null;
    };

    const refreshUser = () => {
        user.value = authService.getCurrentUser();
    };

    const hasRole = (role) => {
        return user.value?.authorities?.includes(role) || false;
    };

    const hasAnyRole = (roles) => {
        if (!user.value?.authorities) return false;
        const roleArray = Array.isArray(roles) ? roles : roles.split(',').map(r => r.trim());
        return roleArray.some(role => user.value.authorities.includes(role));
    };

    return {
        user,
        isAuthenticated,
        username,
        roles,
        token,
        login,
        logout,
        refreshUser,
        hasRole,
        hasAnyRole
    };
});