import Cookies from 'js-cookie'

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

const TOKEN_KEY = 'claesen_token'
const USER_KEY = 'claesen_user'

export const getToken = (): string | null => {
    // Try cookies first, fallback to localStorage
    return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
    // Store in both cookies and localStorage for redundancy
    Cookies.set(TOKEN_KEY, token, {
        expires: 7, // 7 days
        secure: import.meta.env.PROD, // Only secure in production
        sameSite: 'strict'
    })
    localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
    Cookies.remove(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

export const getUser = (): User | null => {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
}

export const setUser = (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}
