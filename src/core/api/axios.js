import axios from 'axios';
import { useLoading } from '@/core/composables/useLoading.js';
import authService from './authService.js';

const { startLoading, stopLoading } = useLoading();

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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
    async (config) => {
        startLoading();
        
        // Asegurar que headers existe
        if (!config.headers) {
            config.headers = {};
        }
        
        // No procesar token para rutas de auth
        if (config.url.includes('/auth/login') || config.url.includes('/auth/refresh')) {
            return config;
        }
        
        // Obtener el token del localStorage
        const userStr = localStorage.getItem('user');
        
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user?.token) {
                    const token = user.token.trim();
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('Token agregado:', config.headers.Authorization.substring(0, 50) + '...');
                }
            } catch (error) {
                console.error('Error parsing user from localStorage:', error);
            }
        }
        
        // Verificar si el token está por expirar
        if (authService.isTokenExpiringSoon()) {
            const refreshToken = authService.getRefreshToken();
            if (refreshToken && !isRefreshing) {
                try {
                    const response = await authService.refreshToken(refreshToken);
                    const user = authService.getCurrentUser();
                    if (user) {
                        user.token = response.accessToken;
                        user.expiresAt = Date.now() + response.expiresIn;
                        localStorage.setItem('user', JSON.stringify(user));
                        if (response.refreshToken) {
                            localStorage.setItem('refreshToken', response.refreshToken);
                        }
                        config.headers.Authorization = `Bearer ${response.accessToken}`;
                    }
                } catch (error) {
                    console.error('Proactive refresh failed:', error);
                }
            }
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
    async (error) => {
        stopLoading();
        const originalRequest = error.config;
        
        // Si es 401 y no es una ruta de auth
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
                return Promise.reject(error);
            }
            
            if (isRefreshing) {
                // Si ya se está refrescando, agregar a la cola
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            const refreshToken = authService.getRefreshToken();
            
            if (!refreshToken) {
                isRefreshing = false;
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
                globalThis.location.href = '/login';
                return Promise.reject(error);
            }
            
            try {
                const response = await authService.refreshToken(refreshToken);
                const user = authService.getCurrentUser();
                
                if (user) {
                    user.token = response.accessToken;
                    user.expiresAt = Date.now() + response.expiresIn;
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    if (response.refreshToken) {
                        localStorage.setItem('refreshToken', response.refreshToken);
                    }
                    
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                    
                    processQueue(null, response.accessToken);
                    isRefreshing = false;
                    
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
                globalThis.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
