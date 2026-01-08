'use client';

import { MoreHorizontal, UserCircle, Plus } from 'lucide-react';
import { Task, Agent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectKanbanProps {
    tasks: Task[];
    agents: Agent[];
    onAssign: (taskId: string, agentId: string) => void;
}

export function ProjectKanban({ tasks, agents, onAssign }: ProjectKanbanProps) {
    return (
        <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 h-full min-w-max pb-4">
                {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
                    <div key={status} className="w-80 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full",
                                    status === 'TODO' ? 'bg-slate-500' :
                                        status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                            status === 'REVIEW' ? 'bg-purple-500' : 'bg-green-500'
                                )} />
                                {status.replace('_', ' ')}
                            </h3>
                            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">
                                {tasks.filter(t => t.status === status).length}
                            </span>
                        </div>

                        <div className="flex-1 rounded-xl bg-white/5 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                            {tasks.filter(t => t.status === status).map(task => (
                                <div key={task.id} className="glass-card p-4 rounded-lg space-y-3 cursor-grab hover:border-primary/50 group">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                                        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                            task.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' :
                                                task.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                                        )}>
                                            {task.priority}
                                        </span>

                                        {/* Agent Assignee */}
                                        <div className="relative group/assign">
                                            {task.assignedAgentId ? (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-full border border-white/5 hover:bg-secondary/80 transition-colors cursor-pointer">
                                                    <UserCircle className="h-3 w-3" />
                                                    <span className="text-xs font-medium">
                                                        {agents.find(a => a.id === task.assignedAgentId)?.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                                                    <Plus className="h-3 w-3" /> Assign
                                                </button>
                                            )}

                                            {/* Simple Assignment Dropdown Mockup */}
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-xl p-1 hidden group-hover/assign:block z-50">
                                                {agents.map(agent => (
                                                    <button
                                                        key={agent.id}
                                                        onClick={() => onAssign(task.id, agent.id)}
                                                        className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"
                                                    >
                                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                                        {agent.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-2 text-xs text-muted-foreground border border-dashed border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                                <Plus className="h-3 w-3" /> New Task
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
