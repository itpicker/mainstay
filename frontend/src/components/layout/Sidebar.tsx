'use client';

import { LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Agents', href: '/agents', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 border-r border-border h-screen bg-card/30 glass sticky top-0">
            <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Mainstay
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Autonomous Agent OS</p>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden',
                                isActive
                                    ? 'text-primary-foreground bg-primary shadow-lg shadow-primary/25'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                            {item.name}
                            {isActive && (
                                <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                            )}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-white/10" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                        <p className="text-xs text-muted-foreground truncate">admin@mainstay.ai</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
