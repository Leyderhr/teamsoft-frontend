import axios from 'axios';
import { useLoading } from '@/core/composables/useLoading.js';
import { useAuthStore } from '@/core/store/authStore.js';

const { startLoading, stopLoading } = useLoading();

// Configuración base de axios
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar el token y activar loading
apiClient.interceptors.request.use(
    (config) => {
        startLoading();
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        stopLoading();
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta y desactivar loading
apiClient.interceptors.response.use(
    (response) => {
        stopLoading();
        return response;
    },
    (error) => {
        stopLoading();
        if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.user = null;
            localStorage.removeItem('user');
            globalThis.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
