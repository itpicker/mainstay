import axios from 'axios';
import { supabase } from '@/lib/supabase';

// Helper to get current session token
const getAuthToken = async () => {
    // console.log("[Auth] Getting session...");
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error("[Auth] Session error:", error);
    // console.log("[Auth] Session retrieved:", session ? "Found" : "Null");
    return session?.access_token;
};

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 10000, // 10s timeout to prevent infinite hang
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Auth Token
api.interceptors.request.use(async (config) => {
    // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    try {
        const token = await getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // console.log("[API] Token attached");
        } else {
            console.warn("[API] No auth token found - request might fail");
        }
    } catch (error) {
        console.error('Error fetching auth token:', error);
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            console.warn('Unauthorized access. Session might be expired.');
        }
        return Promise.reject(error);
    }
);
