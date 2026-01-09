'use client';

import { Task, Agent, ProjectStage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UserCircle, Calendar, Plus, ChevronDown, ChevronRight, Edit2, Trash2, Check, X } from 'lucide-react';
import { useState, Fragment } from 'react';
import { formatDate } from '@/lib/date';

interface ProjectTableProps {
    tasks: Task[];
    agents: Agent[];
    stages: ProjectStage[];
    onTaskClick: (task: Task) => void;
    onCreateTask: (status: string) => void;
    onUpdateStage: (stageId: string, newName: string) => void;
    onDeleteStage: (stageId: string) => void;
}

export function ProjectTable({
    tasks,
    agents,
    stages,
    onTaskClick,
    onCreateTask,
    onUpdateStage,
    onDeleteStage
}: ProjectTableProps) {
    const [collapsedStages, setCollapsedStages] = useState<string[]>([]);
    const [editingStageId, setEditingStageId] = useState<string | null>(null);
    const [editStageName, setEditStageName] = useState('');

    const toggleStage = (stageId: string) => {
        setCollapsedStages(prev =>
            prev.includes(stageId) ? prev.filter(id => id !== stageId) : [...prev, stageId]
        );
    };

    const handleStartEdit = (stage: ProjectStage, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingStageId(stage.id);
        setEditStageName(stage.name);
    };

    const handleSaveEdit = (stageId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (editStageName.trim()) {
            onUpdateStage(stageId, editStageName);
        }
        setEditingStageId(null);
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingStageId(null);
    };

    const handleDelete = (stageId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this stage?')) {
            onDeleteStage(stageId);
        }
    };

    return (
        <div className="flex-1 overflow-auto rounded-lg border border-white/5 glass-card">
            <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                        <th className="px-4 py-3 font-medium text-muted-foreground w-[40%]">Task</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Priority</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Assignee</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {stages.map(stage => {
                        const stageTasks = tasks.filter(t => t.status === stage.id);
                        const isCollapsed = collapsedStages.includes(stage.id);
                        const isEditing = editingStageId === stage.id;

                        return (
                            <Fragment key={stage.id}>
                                {/* Group Header */}
                                <tr className="bg-white/5 group/header">
                                    <td colSpan={4} className="px-4 py-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1">
                                                <button
                                                    onClick={() => toggleStage(stage.id)}
                                                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                                                >
                                                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </button>

                                                <span className={cn("w-2 h-2 rounded-full", stage.color)}></span>

                                                {isEditing ? (
                                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                        <input
                                                            autoFocus
                                                            className="bg-white/10 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                            value={editStageName}
                                                            onChange={(e) => setEditStageName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveEdit(stage.id);
                                                                if (e.key === 'Escape') setEditingStageId(null);
                                                            }}
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                        <button onClick={(e) => handleSaveEdit(stage.id, e)} className="p-1 hover:text-green-500"><Check className="h-3 w-3" /></button>
                                                        <button onClick={handleCancelEdit} className="p-1 hover:text-red-500"><X className="h-3 w-3" /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="font-semibold text-sm">{stage.name}</span>
                                                        <span className="text-xs text-muted-foreground font-normal">
                                                            ({stageTasks.length})
                                                        </span>

                                                        <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity ml-2">
                                                            <button
                                                                onClick={(e) => handleStartEdit(stage, e)}
                                                                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-white/10"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(stage.id, e)}
                                                                className="p-1 text-muted-foreground hover:text-red-500 rounded hover:bg-white/10"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>

                                {/* Tasks */}
                                {!isCollapsed && stageTasks.map(task => (
                                    <tr
                                        key={task.id}
                                        onClick={() => onTaskClick(task)}
                                        className={cn(
                                            "hover:bg-white/5 transition-colors group cursor-pointer",
                                            task.description === 'Generated by AI' ? "bg-purple-500/5 hover:bg-purple-500/10 text-purple-200" : ""
                                        )}
                                    >
                                        <td className="px-4 py-3 pl-12"> {/* Indented */}
                                            <div className="font-medium text-foreground flex items-center gap-2">
                                                {task.title}
                                                {task.activeReviewRequestId && (
                                                    <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded border border-orange-500/20 font-bold whitespace-nowrap">
                                                        REVIEW
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
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
                                            {task.endDate ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDate(task.endDate)}
                                                </div>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {!isCollapsed && (
                                    <tr onClick={() => onCreateTask(stage.id)} className="cursor-pointer hover:bg-white/5 transition-colors border-dashed border-white/10">
                                        <td colSpan={4} className="px-4 py-2 pl-12 text-xs text-muted-foreground hover:text-primary transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-3 w-3" /> Add Task to {stage.name}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
