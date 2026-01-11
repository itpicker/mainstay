'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        router.push('/projects'); // Redirect to dashboard
    };

    const signup = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });
        if (error) throw error;
        // Check if email confirmation is required? 
        // For dev, if disabled, it logs in automatically.
        router.push('/projects');
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
