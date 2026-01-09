'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        // For mock auth, signup is same as login
        login(email);
        setIsLoading(false);
    };

    return (
        <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Get Started
                </h1>
                <p className="text-muted-foreground text-sm mt-2">
                    Join the future of autonomous project management
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-secondary/50 focus:border-primary/50 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-secondary/50 focus:border-primary/50 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-secondary/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-secondary/50 focus:border-primary/50 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                            placeholder="Create a strong password"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 mt-6 transition-all",
                        "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-primary/25",
                        isLoading && "opacity-80 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            Create Account <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
