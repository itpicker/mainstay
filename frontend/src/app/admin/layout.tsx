'use client';

import { Users, Server, BarChart3, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Models', href: '/admin/models', icon: Server },
        { name: 'Users', href: '/admin/users', icon: Users },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/30 flex flex-col">
                <div className="p-6 border-b border-border flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground">
                        A
                    </div>
                    <span className="font-bold text-lg">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <Link
                        href="/projects"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
