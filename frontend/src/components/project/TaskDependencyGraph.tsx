'use client';

import { Task, Agent } from '@/lib/types';
import { ArrowRight, Lock, CheckCircle2, UserCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentOrchestrator } from '@/lib/orchestrator';

interface TaskDependencyGraphProps {
    tasks: Task[];
    agents: Agent[];
}

export function TaskDependencyGraph({ tasks, agents }: TaskDependencyGraphProps) {
    // 1. Group Agents (Define Columns)
    // We want a specific order: PM -> Design -> Dev -> Reviewer
    // For prototype, we'll manually order or filter.
    const orderedRoles = ['MANAGER', 'RESEARCHER', 'DESIGNER', 'DEVELOPER', 'REVIEWER'];

    // Create columns based on agents available in the mock
    const columns = orderedRoles.map(role => {
        const agent = agents.find(a => a.role === role);
        return {
            role,
            agent,
            tasks: tasks.filter(t => {
                // Assign to column if agent ID matches OR if agent is missing but role matches logic
                // For simplicity, we match by exact assignedAgentId
                return t.assignedAgentId === agent?.id;
            })
        };
    }).filter(col => col.agent); // Only show columns for active agents

    return (
        <div className="p-6 overflow-x-auto bg-slate-900/50 rounded-xl border border-white/10 min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-blue-400">⚡️</span> Agent Workflow Board
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Visualize how work flows between AI Specialists.
                    </p>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Completed</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-blue-500"></div>In Progress</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-red-500 bg-red-500/10"></div>Blocked</div>
                </div>
            </div>

            <div className="flex gap-6 min-w-max">
                {columns.map((col, colIndex) => (
                    <div key={col.role} className="flex flex-col w-[320px] shrink-0">
                        {/* Agent Header */}
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-t-xl border-b border-white/5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-blue-300" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">{col.agent?.name}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{col.agent?.role}</div>
                            </div>
                            <div className={cn(
                                "ml-auto px-2 py-0.5 rounded text-[10px] font-bold border",
                                col.agent?.status === 'BUSY' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    "bg-slate-500/10 text-slate-400 border-white/5"
                            )}>
                                {col.agent?.status}
                            </div>
                        </div>

                        {/* Swimlane Body */}
                        <div className="flex-1 bg-white/[0.02] border-x border-b border-white/5 rounded-b-xl p-4 flex flex-col gap-4 relative min-h-[400px]">
                            {/* Dotted Guideline */}
                            <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-white/5 pointer-events-none" />

                            {col.tasks.map(task => {
                                const { allowed, blockingTaskIds } = AgentOrchestrator.checkDependencies(task, tasks);

                                return (
                                    <div key={task.id} className={cn(
                                        "relative p-4 rounded-lg border transition-all hover:border-white/20 z-10 group",
                                        task.status === 'done' ? "bg-green-500/5 border-green-500/20" :
                                            !allowed ? "bg-red-500/5 border-red-500/20" :
                                                "bg-card border-white/10"
                                    )}>
                                        {/* Status Line */}
                                        <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-r-full",
                                            task.status === 'done' ? "bg-green-500" :
                                                !allowed ? "bg-red-500" : "bg-blue-500 hidden"
                                        )} />

                                        <div className="flex items-start justify-between mb-2">
                                            <div className="text-xs font-mono text-muted-foreground">ID-{task.id}</div>
                                            {task.status === 'done' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                            {!allowed && <Lock className="h-4 w-4 text-red-500" />}
                                        </div>

                                        <h4 className="text-sm font-medium mb-3 leading-snug">{task.title}</h4>

                                        {/* Dependencies/Blockers Info */}
                                        {task.dependencies && task.dependencies.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                                                <div className="text-[10px] text-muted-foreground font-semibold uppercase">Dependencies</div>
                                                {task.dependencies.map(depId => {
                                                    const depTask = tasks.find(t => t.id === depId);
                                                    const isDepDone = depTask?.status === 'done';

                                                    return (
                                                        <div key={depId} className="flex items-center gap-1.5 text-[10px]">
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", isDepDone ? "bg-green-500" : "bg-red-500")} />
                                                            <span className={cn(isDepDone ? "text-muted-foreground line-through" : "text-red-300")}>
                                                                {depTask ? depTask.title.substring(0, 20) + '...' : `Task #${depId}`}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {col.tasks.length === 0 && (
                                <div className="text-center py-10 text-xs text-muted-foreground/30 italic">
                                    No active tasks
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
