'use client';

import { Plus, Folder, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Project, Workspace } from '@/lib/types';

// Mock data
const defaultStages = [
    { id: 'todo', name: 'To Do', color: 'bg-slate-500' },
    { id: 'in_progress', name: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', name: 'Review', color: 'bg-purple-500' },
    { id: 'done', name: 'Done', color: 'bg-green-500' },
];

const mockWorkspaces: Workspace[] = [
    { id: 'ws-personal', name: 'Personal Workspace', type: 'PERSONAL' },
    { id: 'ws-toss', name: 'Toss Lab - Dev Team', type: 'TEAM' },
];

const mockProjects: Project[] = [
    {
        id: '1',
        workspaceId: 'ws-toss',
        name: 'Website Redesign',
        description: 'Overhaul of the corporate website with new branding.',
        status: 'ACTIVE',
        createdAt: '2025-12-01',
        taskCount: 12,
        completedTaskCount: 5,
        stages: defaultStages
    },
    {
        id: '2',
        workspaceId: 'ws-toss',
        name: 'Market Research 2026',
        description: 'Analysis of emerging AI trends for the next fiscal year.',
        status: 'PLANNING',
        createdAt: '2026-01-05',
        taskCount: 8,
        completedTaskCount: 0,
        stages: defaultStages
    },
    {
        id: '3',
        workspaceId: 'ws-personal',
        name: 'Personal Portfolio',
        description: 'My personal portfolio website built with Next.js.',
        status: 'COMPLETED',
        createdAt: '2025-11-15',
        taskCount: 20,
        completedTaskCount: 20,
        stages: defaultStages
    },
];

export default function ProjectsPage() {
    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">Manage all your projects across workspaces.</p>
                </div>
                <Link
                    href="/projects/new"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Link>
            </div>

            {mockWorkspaces.map((workspace) => {
                const workspaceProjects = mockProjects.filter((p) => p.workspaceId === workspace.id);
                if (workspaceProjects.length === 0) return null;

                return (
                    <div key={workspace.id} className="space-y-4">
                        <div className="flex items-center space-x-2 border-b border-border/40 pb-2">
                            <h2 className="text-lg font-semibold text-foreground/90">{workspace.name}</h2>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${workspace.type === 'PERSONAL'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                }`}>
                                {workspace.type}
                            </span>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {workspaceProjects.map((project) => (
                                <Link key={project.id} href={`/projects/${project.id}`}>
                                    <div className="glass-card rounded-xl p-6 flex flex-col group cursor-pointer hover:border-primary/50 transition-all duration-300 h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <Folder className="h-6 w-6" />
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${project.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                project.status === 'PLANNING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{project.description}</p>

                                        <div className="mt-auto pt-4 border-t border-dashed border-white/10 flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                                {project.completedTaskCount}/{project.taskCount} Tasks
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1.5" />
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                style={{ width: `${(project.completedTaskCount / project.taskCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
