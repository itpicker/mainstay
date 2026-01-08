'use client';

import { Bell, Search } from 'lucide-react';

export function Header() {
    return (
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
            <div className="flex items-center flex-1 max-w-lg">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search projects, tasks, or agents..."
                        className="w-full bg-secondary/50 border border-transparent focus:border-primary/50 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
                </button>
            </div>
        </header>
    );
}
