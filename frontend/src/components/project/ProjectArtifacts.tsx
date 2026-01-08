'use client';

import { Task, Artifact } from '@/lib/types';
import { FileCode, FileText, Image as ImageIcon, Archive, Download, ExternalLink } from 'lucide-react';

interface ProjectArtifactsProps {
    tasks: Task[];
}

const iconMap = {
    'CODE': FileCode,
    'DOCUMENT': FileText,
    'IMAGE': ImageIcon,
    'ARCHIVE': Archive
};

export function ProjectArtifacts({ tasks }: ProjectArtifactsProps) {
    // Flatten artifacts from tasks
    const allArtifacts = tasks.flatMap(t =>
        (t.artifacts || []).map(a => ({ ...a, taskTitle: t.title }))
    );

    return (
        <div className="flex-1 overflow-auto">
            {allArtifacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
                    <Archive className="h-10 w-10 mb-2 opacity-50" />
                    <p>No artifacts generated yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {allArtifacts.map((artifact) => {
                        const Icon = iconMap[artifact.type] || FileText;
                        return (
                            <div key={artifact.id} className="glass-card p-4 rounded-xl flex flex-col group relative overflow-hidden">
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 bg-background rounded-full hover:text-primary transition-colors"><Download className="h-3.5 w-3.5" /></button>
                                    <button className="p-1.5 bg-background rounded-full hover:text-primary transition-colors"><ExternalLink className="h-3.5 w-3.5" /></button>
                                </div>

                                <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center mb-3 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    <Icon className="h-6 w-6" />
                                </div>

                                <h4 className="font-medium text-sm truncate" title={artifact.name}>{artifact.name}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{artifact.type}</p>
                                <p className="text-[10px] text-muted-foreground/70 truncate mt-auto">from {artifact.taskTitle}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
