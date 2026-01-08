'use client';

import { Kanban, List, Calendar, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProjectView = 'KANBAN' | 'TABLE' | 'TIMELINE' | 'ARTIFACTS';

interface ViewSwitcherProps {
    currentView: ProjectView;
    onViewChange: (view: ProjectView) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    const views: { id: ProjectView; label: string; icon: any }[] = [
        { id: 'KANBAN', label: 'Board', icon: Kanban },
        { id: 'TABLE', label: 'List', icon: List },
        { id: 'TIMELINE', label: 'Timeline', icon: Calendar },
        { id: 'ARTIFACTS', label: 'Artifacts', icon: FolderOpen },
    ];

    return (
        <div className="flex p-1 bg-secondary/50 rounded-lg border border-white/5">
            {views.map((view) => (
                <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        currentView === view.id
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    <view.icon className="h-3.5 w-3.5" />
                    {view.label}
                </button>
            ))}
        </div>
    );
}
