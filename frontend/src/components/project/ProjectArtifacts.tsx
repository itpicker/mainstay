'use client';

import { Task, Artifact } from '@/lib/types';
import { Archive, FileCode, FileText, Globe, Layers, Layout, Zap } from 'lucide-react';
import { DeliverableCard } from './DeliverableCard';

interface ProjectArtifactsProps {
    tasks: Task[];
}

export function ProjectArtifacts({ tasks }: ProjectArtifactsProps) {
    // Flatten artifacts from tasks
    const allArtifacts = tasks.flatMap(t =>
        (t.artifacts || []).map(a => ({ ...a, taskTitle: t.title }))
    );

    // Grouping
    const groups = {
        deployment: allArtifacts.filter(a => a.type === 'DEPLOYMENT'),
        code: allArtifacts.filter(a => a.type === 'CODE' || a.type === 'ARCHIVE'), // Group Code & Archives
        design: allArtifacts.filter(a => a.type === 'IMAGE'),
        planning: allArtifacts.filter(a => a.type === 'DOCUMENT'),
    };

    const sections = [
        { id: 'deployment', title: 'Deployments & Environments', icon: Globe, items: groups.deployment, color: 'text-green-500' },
        { id: 'code', title: 'Code & Builds', icon: FileCode, items: groups.code, color: 'text-blue-500' },
        { id: 'design', title: 'Design & Assets', icon: Layout, items: groups.design, color: 'text-purple-500' },
        { id: 'planning', title: 'Planning & Requirements', icon: FileText, items: groups.planning, color: 'text-orange-500' },
    ];

    if (allArtifacts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                <Archive className="h-10 w-10 mb-2 opacity-30" />
                <p>No deliverables generated yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Artifacts from tasks will appear here.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto space-y-8 pb-10">
            {sections.map(section => {
                if (section.items.length === 0) return null;

                return (
                    <div key={section.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg bg-white/5 ${section.color}`}>
                                <section.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold">{section.title}</h3>
                            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                                {section.items.length}
                            </span>
                        </div>

                        <div className={`grid gap-4 ${section.id === 'deployment' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {section.items.map(artifact => (
                                <DeliverableCard
                                    key={artifact.id}
                                    artifact={artifact}
                                    taskTitle={'taskTitle' in artifact ? (artifact as any).taskTitle : undefined}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
