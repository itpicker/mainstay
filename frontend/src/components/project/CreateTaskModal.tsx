'use client';

import { useState } from 'react';
import { X, Save, CheckSquare, Square, Trash2, Calendar, UserCircle } from 'lucide-react';
import { Agent, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: {
        title: string;
        description: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        assignedAgentId?: string;
        subtasks: { id: string; title: string; completed: boolean }[];
        startDate?: string;
        endDate?: string;
    }) => void;
    agents: Agent[];
    defaultStatus?: TaskStatus;
}

export function CreateTaskModal({ isOpen, onClose, onSave, agents, defaultStatus }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [assignedAgentId, setAssignedAgentId] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Subtask State
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    if (!isOpen) return null;

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskTitle.trim()) return;

        const newSubtask = {
            id: Math.random().toString(36).substr(2, 9),
            title: newSubtaskTitle,
            completed: false
        };

        setSubtasks([...subtasks, newSubtask]);
        setNewSubtaskTitle('');
    };

    const handleToggleSubtask = (id: string) => {
        setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
    };

    const handleDeleteSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    const handleSubmit = () => {
        if (!title.trim()) return;

        onSave({
            title,
            description,
            priority,
            assignedAgentId: assignedAgentId || undefined,
            subtasks,
            startDate: startDate || undefined,
            endDate: endDate || undefined
        });

        // Reset
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setAssignedAgentId('');
        setSubtasks([]);
        setStartDate('');
        setEndDate('');
        setNewSubtaskTitle('');
        onClose();
    };

    const completedCount = subtasks.filter(st => st.completed).length;
    const totalCount = subtasks.length;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-4xl h-[85vh] rounded-xl border border-white/10 shadow-2xl flex overflow-hidden glass-card">

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-background/50">
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-white/5">
                        <div className="space-y-1 flex-1 mr-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-slate-500/10 text-slate-500 border-slate-500/20">
                                    {(defaultStatus || 'TODO').replace('_', ' ')}
                                </span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">NEW TASK</span>
                            </div>
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-transparent border-none text-2xl font-bold leading-tight placeholder:text-muted-foreground/50 focus:outline-none"
                                placeholder="Enter task title..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
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
                            <textarea
                                rows={4}
                                className="w-full bg-secondary/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                placeholder="Add detailed description..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
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
                                {subtasks.map(subtask => (
                                    <div key={subtask.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <button
                                            onClick={() => handleToggleSubtask(subtask.id)}
                                            className={cn("shrink-0 transition-colors", subtask.completed ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                                        >
                                            {subtask.completed ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                        </button>
                                        <span className={cn("flex-1 text-sm pt-0.5", subtask.completed && "text-muted-foreground line-through decoration-white/20")}>
                                            {subtask.title}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteSubtask(subtask.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
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
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-secondary/20 border-l border-white/5 p-6 flex flex-col gap-8 overflow-y-auto">
                    {/* Assignee */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Assignee</label>
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <UserCircle className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <select
                                    className="w-full bg-transparent border-none text-sm font-medium focus:outline-none cursor-pointer"
                                    value={assignedAgentId}
                                    onChange={e => setAssignedAgentId(e.target.value)}
                                >
                                    <option value="" className="bg-gray-900 text-gray-100">Unassigned</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id} className="bg-gray-900 text-gray-100">
                                            {agent.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</label>
                            <div className="flex items-center gap-2 text-sm bg-white/5 rounded-lg border border-white/5 px-3 py-2">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <input
                                    type="date"
                                    className="bg-transparent border-none focus:outline-none w-full text-xs text-muted-foreground"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date</label>
                            <div className="flex items-center gap-2 text-sm bg-white/5 rounded-lg border border-white/5 px-3 py-2">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <input
                                    type="date"
                                    className="bg-transparent border-none focus:outline-none w-full text-xs text-muted-foreground"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
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
                                    onClick={() => setPriority(level as any)}
                                    className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                        priority === level
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

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={!title.trim()}
                            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Save className="h-4 w-4" /> Create Task
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
