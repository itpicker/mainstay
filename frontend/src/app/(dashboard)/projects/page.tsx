'use client';

import { Plus, Folder, Clock, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { formatDate } from '@/lib/date';
import { useState, useEffect } from 'react';
import { ProjectService } from '@/lib/api/projects';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debug, setDebug] = useState("Init"); // Debug state

    useEffect(() => {
        const fetchProjects = async () => {
            setDebug("Starting fetchProjects...");
            setError(null);
            try {
                setDebug("Calling API (ProjectService.getAllProjects)...");
                const data = await ProjectService.getAllProjects();

                setDebug(`API Responded. Items: ${Array.isArray(data) ? data.length : 'Not Array'}`);

                // Map API response
                setDebug("Mapping data...");
                const mappedProjects = data.map((p: any) => ({
                    ...p,
                    name: p.title,
                    description: p.description || "",
                    createdAt: p.created_at,
                    workspaceId: 'default',
                    status: p.status || 'PLANNING',
                    lifecycle: 'PLANNING',
                    isAgentsActive: false,
                    stages: [],
                    taskCount: 0,
                    completedTaskCount: 0
                }));
                setProjects(mappedProjects);
                setDebug("State updated.");
            } catch (err: any) {
                console.error("Failed to fetch projects:", err);
                setDebug(`Error caught: ${err.message}`);
                setError("Failed to load projects. Please check your connection.");
            } finally {
                setDebug("Finally block reached.");
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm font-mono text-muted-foreground">Debug: {debug}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-lg font-medium text-destructive">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80"
                >
                    Retry
                </button>
            </div>
        );
    }

    // DEBUG: Dump state to see if data exists
    // return <pre className="text-xs text-left overflow-auto h-96">{JSON.stringify({ projects, isLoading, error }, null, 2)}</pre>;

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">Manage all your projects.</p>
                </div>
                <Link
                    href="/projects/new"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Link>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-border/40 pb-2">
                    <h2 className="text-lg font-semibold text-foreground/90">My Projects</h2>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20 bg-secondary/10 rounded-xl border border-dashed border-white/10">
                        <Folder className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                        <p className="text-muted-foreground">No projects found. Create one to get started.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
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
                                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[2.5rem]">{project.description || "No description provided"}</p>

                                    <div className="mt-auto pt-4 border-t border-dashed border-white/10 flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                            {project.completedTaskCount}/{project.taskCount} Tasks
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1.5" />
                                            {formatDate(project.createdAt)}
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                            style={{ width: `${project.taskCount > 0 ? (project.completedTaskCount / project.taskCount) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
