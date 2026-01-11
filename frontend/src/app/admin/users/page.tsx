'use client';

import { useState, useEffect } from 'react';
import { Users, MoreVertical, Shield, ShieldAlert, BadgeCheck, Loader2 } from 'lucide-react';
import { AdminService, UserProfile } from '@/lib/api/admin';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await AdminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromoteAdmin = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'Assign Admin Role' : 'Remove Admin Role';

        if (!confirm(`Are you sure you want to ${action} for this user?`)) return;

        try {
            await AdminService.updateUser(userId, { role: newRole });
            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Failed to update user:", error);
            alert("Failed to update user role.");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    User Management
                </h1>
                <span className="text-sm text-muted-foreground">Total: {users.length} Users</span>
            </div>

            <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-secondary/50 border-b border-border text-muted-foreground">
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Joined Date</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.email} className="h-full w-full object-cover" />
                                            ) : (
                                                user.email?.[0]?.toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">{user.full_name || 'No Name'}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.role === 'admin' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                            <Shield className="h-3 w-3" /> Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                                            User
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handlePromoteAdmin(user.id, user.role)}
                                        className="text-muted-foreground hover:text-primary transition-colors text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary"
                                    >
                                        {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
