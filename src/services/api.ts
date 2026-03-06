import axios from 'axios'
import { getToken, removeToken } from '../utils/storage'

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8001/v1/website'
const baseUrl = import.meta.env.BASE_URL || '/'
export const ASSET_URL = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`

console.log('API_BASE_URL:', API_BASE_URL)
console.log('Environment variables:', import.meta.env)

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000, // 10 seconds timeout
    withCredentials: false
})

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            headers: config.headers
        })

        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            config.headers['X-Requested-With'] = 'XMLHttpRequest'
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
            removeToken()
            // Only redirect if we're in an admin route and not already on the login page
            const isAdminRoute = window.location.pathname.startsWith(`${import.meta.env.BASE_URL}admin`)
            if (isAdminRoute && !window.location.pathname.includes('/login')) {
                window.location.href = `${import.meta.env.BASE_URL}admin/login`
            }
        }

        // Handle CORS and network errors
        if (!error.response) {
            console.warn('Network error or CORS issue:', error.message)
            // Don't reject for CORS errors, let services handle gracefully
            if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
                error.message = 'Endpoint no disponible (CORS/Network error)'
            }
        }

        // Enhanced error handling
        if (error.response?.data?.message) {
            error.message = error.response.data.message
        }

        return Promise.reject(error)
    }
)

export default apiClient
