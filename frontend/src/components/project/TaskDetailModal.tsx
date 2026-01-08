'use client';

import { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Trash2, Calendar, UserCircle, Paperclip, Edit2, Check } from 'lucide-react';
import { Task, Agent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProjectArtifacts } from './ProjectArtifacts';

interface TaskDetailModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedTask: Task) => void;
    agents: Agent[];
}

export function TaskDetailModal({ task, isOpen, onClose, onUpdate, agents }: TaskDetailModalProps) {
    const [currentTask, setCurrentTask] = useState<Task | null>(task);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    // Subtask Editing State
    const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
    const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

    useEffect(() => {
        setCurrentTask(task);
    }, [task]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !currentTask) return null;

    // --- Subtask Handlers ---
    const handleToggleSubtask = (subtaskId: string) => {
        if (!currentTask.subtasks) return;
        const updatedSubtasks = currentTask.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        updateTask({ ...currentTask, subtasks: updatedSubtasks });
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskTitle.trim()) return;

        const newSubtask = {
            id: Math.random().toString(36).substr(2, 9),
            title: newSubtaskTitle,
            completed: false
        };

        const updatedSubtasks = [...(currentTask.subtasks || []), newSubtask];
        updateTask({ ...currentTask, subtasks: updatedSubtasks });
        setNewSubtaskTitle('');
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        const updatedSubtasks = (currentTask.subtasks || []).filter(st => st.id !== subtaskId);
        updateTask({ ...currentTask, subtasks: updatedSubtasks });
    };

    const handleStartEditSubtask = (subtask: { id: string, title: string }) => {
        setEditingSubtaskId(subtask.id);
        setEditingSubtaskTitle(subtask.title);
    };

    const handleSaveEditSubtask = () => {
        if (!editingSubtaskId || !editingSubtaskTitle.trim()) return;

        const updatedSubtasks = (currentTask.subtasks || []).map(st =>
            st.id === editingSubtaskId ? { ...st, title: editingSubtaskTitle } : st
        );
        updateTask({ ...currentTask, subtasks: updatedSubtasks });
        setEditingSubtaskId(null);
    };

    // --- Priority Handler ---
    const handlePriorityChange = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
        updateTask({ ...currentTask, priority });
    };

    const updateTask = (updated: Task) => {
        setCurrentTask(updated);
        onUpdate(updated);
    };

    const completedCount = (currentTask.subtasks || []).filter(st => st.completed).length;
    const totalCount = (currentTask.subtasks || []).length;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-4xl h-[85vh] rounded-xl border border-white/10 shadow-2xl flex overflow-hidden glass-card">

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-background/50">
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-white/5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border",
                                    currentTask.status === 'todo' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' :
                                        currentTask.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            currentTask.status === 'review' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                currentTask.status === 'done' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    'bg-white/10 text-muted-foreground border-white/20'
                                )}>
                                    {currentTask.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">#{currentTask.id}</span>
                            </div>
                            <h2 className="text-2xl font-bold leading-tight">{currentTask.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <X className="h-6 w-6 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                {currentTask.description || "No description provided."}
                            </p>
                        </div>

                        {/* Subtasks */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4" /> Subtasks
                                </h3>
                                <span className="text-xs text-muted-foreground font-mono">
                                    {completedCount}/{totalCount} Completed
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="space-y-2">
                                {(currentTask.subtasks || []).map(subtask => (
                                    <div key={subtask.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <button
                                            onClick={() => handleToggleSubtask(subtask.id)}
                                            className={cn("shrink-0 transition-colors", subtask.completed ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                                        >
                                            {subtask.completed ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            {editingSubtaskId === subtask.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        autoFocus
                                                        className="w-full bg-black/20 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                        value={editingSubtaskTitle}
                                                        onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditSubtask()}
                                                    />
                                                    <button onClick={handleSaveEditSubtask} className="hover:text-green-500"><Check className="h-4 w-4" /></button>
                                                    <button onClick={() => setEditingSubtaskId(null)} className="hover:text-red-500"><X className="h-4 w-4" /></button>
                                                </div>
                                            ) : (
                                                <span className={cn("text-sm", subtask.completed && "text-muted-foreground line-through decoration-white/20")}>
                                                    {subtask.title}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleStartEditSubtask(subtask)}
                                                className="p-1.5 text-muted-foreground hover:text-foreground transition-all"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSubtask(subtask.id)}
                                                className="p-1.5 text-muted-foreground hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Subtask Input */}
                                <form onSubmit={handleAddSubtask} className="flex items-center gap-3 p-2 pl-3 mt-2">
                                    <div className="shrink-0 text-muted-foreground/50"><Square className="h-5 w-5" /></div>
                                    <input
                                        type="text"
                                        value={newSubtaskTitle}
                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                        placeholder="Add a new subtask..."
                                        className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-muted-foreground/50"
                                    />
                                </form>
                            </div>
                        </div>

                        {/* Artifacts Preview */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Paperclip className="h-4 w-4" /> Attached Artifacts
                            </h3>
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <ProjectArtifacts tasks={[currentTask]} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-secondary/20 border-l border-white/5 p-6 space-y-8 overflow-y-auto">
                    {/* Assignee */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Assignee</label>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <div className="text-sm font-medium">
                                    {agents.find(a => a.id === currentTask.assignedAgentId)?.name || "Unassigned"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {agents.find(a => a.id === currentTask.assignedAgentId)?.role || "No Role"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</label>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {currentTask.startDate ? new Date(currentTask.startDate).toLocaleDateString() : "-"}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date</label>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {currentTask.endDate ? new Date(currentTask.endDate).toLocaleDateString() : "-"}
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                        <div className="flex gap-2">
                            {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => handlePriorityChange(level as any)}
                                    className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                        currentTask.priority === level
                                            ? level === 'HIGH' ? 'bg-red-500/20 text-red-500 border-red-500/50'
                                                : level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                                                    : 'bg-blue-500/20 text-blue-500 border-blue-500/50'
                                            : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
