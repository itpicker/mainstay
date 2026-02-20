'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { authApi } from '@/lib/api/auth';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password?: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await fetchProfile(session.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await fetchProfile(session.user);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser: SupabaseUser) => {
        try {
            // Fetch additional profile data from 'profiles' table via valid API or directly if RLS allows
            // For now, we use metadata from authUser and fallback to profiles table later if needed
            // But actually, we defined a trigger to create profile in 'profiles' table.

            // We can also fetch from our backend API /me
            // For initial load speed, we construct basic user object from auth data
            // and relying on metadata if available

            setUser({
                id: authUser.id,
                email: authUser.email!,
                name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                role: 'USER', // Default, logic to determine admin can be added later
                avatarUrl: authUser.user_metadata?.avatar_url
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password?: string) => {
        if (!password) {
            throw new Error("Password is required for real authentication");
        }

        try {
            // Call backend API instead of direct Supabase
            const data = await authApi.login(email, password);

            // Allow Supabase client to sync session if provided by backend (optional but good for consistency)
            // But if we want to hide it completely, we rely on our own state.
            // For now, let's just sync it so other components using supabase directly (if any remain) still work.
            if (data.session) {
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });
                // Updating session will trigger onAuthStateChange
            }

            router.push('/projects');
        } catch (error: any) {
            console.error("Login error via backend:", error);
            throw error;
        }
    };

    const signup = async (email: string, password: string, name: string) => {
        try {
            await authApi.signup(email, password, name);
            // After signup, we might want to auto-login or ask user to confirm email.
            // For now, just redirect to login or dashboard if backend auto-logins.
            // Current backend signup returns {message: ...}, doesn't return session.
            router.push('/login?message=Signup successful. Please log in.');
        } catch (error: any) {
            throw error;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, isLoading }}>
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
