'use client';

import { Task, Agent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UserCircle, Calendar } from 'lucide-react';

interface ProjectTableProps {
    tasks: Task[];
    agents: Agent[];
    onTaskClick: (task: Task) => void;
}

export function ProjectTable({ tasks, agents, onTaskClick }: ProjectTableProps) {
    return (
        <div className="flex-1 overflow-auto rounded-lg border border-white/5 glass-card">
            <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                        <th className="px-4 py-3 font-medium text-muted-foreground w-[40%]">Task</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Priority</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Assignee</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {tasks.map((task) => (
                        <tr
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className="hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                            <td className="px-4 py-3">
                                <div className="font-medium text-foreground">{task.title}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border",
                                    task.status === 'TODO' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' :
                                        task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            task.status === 'REVIEW' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                                )}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={cn("text-xs font-bold",
                                    task.priority === 'HIGH' ? 'text-red-500' :
                                        task.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
                                )}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                {task.assignedAgentId ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                                            <UserCircle className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs">{agents.find(a => a.id === task.assignedAgentId)?.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground text-xs italic">Unassigned</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {task.deadline ? (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(task.deadline).toLocaleDateString()}
                                    </div>
                                ) : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
