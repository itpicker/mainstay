'use client';

import { useState } from 'react';
import { MoreHorizontal, UserCircle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Task, Agent, ProjectStage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectKanbanProps {
    tasks: Task[];
    agents: Agent[];
    stages: ProjectStage[];
    onAssign: (taskId: string, agentId: string) => void;
    onCreateTask: (status: string) => void;
    onTaskClick: (task: Task) => void;
    onAddStage: (name: string) => void;
    onUpdateStage: (stageId: string, newName: string) => void;
    onDeleteStage: (stageId: string) => void;
    onMoveTask: (taskId: string, newStatus: string) => void;
}

export function ProjectKanban({
    tasks,
    agents,
    stages,
    onAssign,
    onCreateTask,
    onTaskClick,
    onAddStage,
    onUpdateStage,
    onDeleteStage,
    onMoveTask
}: ProjectKanbanProps) {
    const [editingStageId, setEditingStageId] = useState<string | null>(null);
    const [editStageName, setEditStageName] = useState('');
    const [isAddingStage, setIsAddingStage] = useState(false);
    const [newStageName, setNewStageName] = useState('');

    // Drag and Drop State
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const handleStartEdit = (stage: ProjectStage) => {
        setEditingStageId(stage.id);
        setEditStageName(stage.name);
    };

    const handleSaveEdit = (stageId: string) => {
        if (editStageName.trim()) {
            onUpdateStage(stageId, editStageName);
        }
        setEditingStageId(null);
    };

    const handleSaveNewStage = () => {
        if (newStageName.trim()) {
            onAddStage(newStageName);
            setNewStageName('');
            setIsAddingStage(false);
        }
    };

    // --- DnD Handlers ---
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
        // Make the drag ghost transparent or custom styled if desired
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId && taskId === draggedTaskId) {
            onMoveTask(taskId, status);
        }
        setDraggedTaskId(null);
    };

    return (
        <div className="flex-1 overflow-x-auto">
            <div className="flex gap-6 h-full min-w-max pb-4 px-1">
                {stages.map((stage) => (
                    <div
                        key={stage.id}
                        className="w-80 flex flex-col gap-4"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="flex items-center justify-between group/header">
                            {editingStageId === stage.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        autoFocus
                                        className="bg-white/10 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={editStageName}
                                        onChange={(e) => setEditStageName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(stage.id)}
                                    />
                                    <button onClick={() => handleSaveEdit(stage.id)} className="p-1 hover:text-green-500"><Check className="h-4 w-4" /></button>
                                    <button onClick={() => setEditingStageId(null)} className="p-1 hover:text-red-500"><X className="h-4 w-4" /></button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                                        <span className={cn("w-2 h-2 rounded-full", stage.color)} />
                                        {stage.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">
                                            {tasks.filter(t => t.status === stage.id).length}
                                        </span>
                                        <div className="opacity-0 group-hover/header:opacity-100 flex items-center transition-opacity">
                                            <button onClick={() => handleStartEdit(stage)} className="p-1 text-muted-foreground hover:text-foreground">
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                            <button onClick={() => onDeleteStage(stage.id)} className="p-1 text-muted-foreground hover:text-red-500">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={cn(
                            "flex-1 rounded-xl bg-white/5 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] transition-colors",
                            draggedTaskId ? "border-2 border-dashed border-white/10 hover:border-primary/50" : ""
                        )}>
                            {tasks.filter(t => t.status === stage.id).map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onClick={() => onTaskClick(task)}
                                    className={cn(
                                        "glass-card p-4 rounded-lg space-y-3 cursor-grab hover:border-primary/50 group active:cursor-grabbing hover:bg-white/5 transition-all shadow-sm hover:shadow-md",
                                        draggedTaskId === task.id ? "opacity-50" : ""
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm leading-tight select-none pointer-events-none">{task.title}</h4>
                                        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {task.description && <p className="text-xs text-muted-foreground line-clamp-2 select-none pointer-events-none">{task.description}</p>}

                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider select-none",
                                            task.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' :
                                                task.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                                        )}>
                                            {task.priority}
                                        </span>

                                        <div className="relative group/assign">
                                            {task.assignedAgentId ? (
                                                <div
                                                    className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-full border border-white/5 hover:bg-secondary/80 transition-colors cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <UserCircle className="h-3 w-3" />
                                                    <span className="text-xs font-medium select-none">
                                                        {agents.find(a => a.id === task.assignedAgentId)?.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button
                                                    className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Plus className="h-3 w-3" /> Assign
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => onCreateTask(stage.id)}
                                className="w-full py-2 text-xs text-muted-foreground border border-dashed border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="h-3 w-3" /> New Task
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Stage Column */}
                <div className="w-80 shrink-0">
                    {isAddingStage ? (
                        <div className="bg-white/5 rounded-xl p-3 space-y-3">
                            <input
                                autoFocus
                                className="w-full bg-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Stage Name..."
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveNewStage()}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveNewStage}
                                    className="flex-1 py-1.5 bg-primary text-primary-foreground rounded text-xs font-bold"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => { setIsAddingStage(false); setNewStageName(''); }}
                                    className="px-3 py-1.5 hover:bg-white/10 rounded text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingStage(true)}
                            className="w-full py-3 rounded-xl border border-dashed border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4" /> Add Stage
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
