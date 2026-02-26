import axios from 'axios';

const firebase_api2 = axios.create({
    baseURL: 'https://extramuraleseb-default-rtdb.firebaseio.com/', // importante la barra final
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar el token a todas las peticiones
firebase_api2.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Agregar el token como parámetro auth en la URL
        config.params = config.params || {};
        config.params.auth = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores 401 (token expirado)
firebase_api2.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
            
            // Redirigir al login
            window.location.href = '/login';
            
            return Promise.reject(new Error('Token expirado. Por favor inicia sesión nuevamente.'));
        }
        return Promise.reject(error);
    }
);

export default firebase_api2;
