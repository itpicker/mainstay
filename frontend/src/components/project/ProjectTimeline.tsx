'use client';

import { Task, Agent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectTimelineProps {
    tasks: Task[];
}

export function ProjectTimeline({ tasks }: ProjectTimelineProps) {
    // Simplified Gantt visualization
    const sortedTasks = [...tasks].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));

    return (
        <div className="flex-1 overflow-auto rounded-lg border border-white/5 glass-card p-6">
            <h3 className="text-lg font-semibold mb-6">Timeline</h3>

            <div className="space-y-6 relative">
                <div className="absolute left-32 top-0 bottom-0 w-px bg-white/10" />

                {sortedTasks.map((task) => (
                    <div key={task.id} className="flex items-center">
                        <div className="w-32 pr-4 text-right text-sm font-medium truncate shrink-0">
                            {task.title}
                        </div>
                        <div className="flex-1 h-8 bg-secondary/30 rounded-full relative overflow-hidden">
                            {/* Mock bar just to show visualization concept */}
                            <div
                                className={cn("absolute top-1 bottom-1 rounded-full opacity-80",
                                    task.status === 'DONE' ? 'bg-green-500' :
                                        task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-500'
                                )}
                                style={{
                                    left: `${Math.random() * 20}%`,
                                    width: `${Math.max(20, Math.random() * 60)}%`
                                }}
                            >
                                <span className="px-2 text-[10px] text-white font-bold leading-6 truncate block">
                                    {new Date(task.startDate || Date.now()).toLocaleDateString()} - {new Date(task.endDate || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 text-center text-sm text-muted-foreground">
                Mock visualization. Real implementation would map dates to pixels.
            </div>
        </div>
    );
}
