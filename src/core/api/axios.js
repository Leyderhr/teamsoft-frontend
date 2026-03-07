import axios from 'axios';

// Configuración base de axios
const apiClient = axios.create({
    baseURL: 'http://localhost:8081',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('user');
            globalThis.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;