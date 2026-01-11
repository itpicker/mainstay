'use client';

import { useState, useEffect } from 'react';
import { Users, Server, Layers, ListTodo, Loader2 } from 'lucide-react';
import { AdminService, SystemStats } from '@/lib/api/admin';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await AdminService.getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">System Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="Active Projects"
                    value={stats.total_projects}
                    icon={Layers}
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                />
                <StatCard
                    title="AI Agents"
                    value={stats.total_agents}
                    icon={Server}
                    color="text-green-500"
                    bg="bg-green-500/10"
                />
                <StatCard
                    title="Tasks Created"
                    value={stats.total_tasks}
                    icon={ListTodo}
                    color="text-orange-500"
                    bg="bg-orange-500/10"
                />
            </div>

            {/* Placeholder for future charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-card border border-border rounded-xl h-[300px] flex items-center justify-center text-muted-foreground">
                    Activity Chart Placeholder
                </div>
                <div className="p-6 bg-card border border-border rounded-xl h-[300px] flex items-center justify-center text-muted-foreground">
                    Resource Usage Placeholder
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
    );
}
