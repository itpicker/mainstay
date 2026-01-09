'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => void; // Mock login just needs email
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for persisted user
        const storedUser = localStorage.getItem('mainstay_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (email: string) => {
        // Mock Login Logic
        const mockUser: User = {
            id: 'mock-user-1',
            email,
            name: email.split('@')[0],
            role: 'ADMIN' // Default to admin for dev
        };
        setUser(mockUser);
        localStorage.setItem('mainstay_user', JSON.stringify(mockUser));
        router.push('/projects/1'); // Redirect to dashboard after login
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('mainstay_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
