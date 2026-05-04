import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3005/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to attach JWT token + mobile platform flag
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Tell backend this is a Capacitor native request → use deep link success URL
        if (Capacitor.isNativePlatform()) {
            config.headers['x-capacitor'] = 'true';
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration/401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Auto logout if 401 response returned from api
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default api;
