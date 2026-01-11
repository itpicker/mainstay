'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectService } from '@/lib/api/projects';

export default function NewProjectPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tasks, setTasks] = useState<{ title: string; description: string }[]>([{ title: '', description: '' }]);
    const [isLoading, setIsLoading] = useState(false);

    const addTask = () => {
        setTasks([...tasks, { title: '', description: '' }]);
    };

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const updateTask = (index: number, field: 'title' | 'description', value: string) => {
        const newTasks = [...tasks];
        newTasks[index][field] = value;
        setTasks(newTasks);
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            alert('Please enter a project title');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create Project
            const project = await ProjectService.createProject({
                title,
                description
            });

            // 2. Create Initial Tasks
            // Run sequentially to ensure order or handle errors individually if needed?
            // Parallel is fine for speed.
            const validTasks = tasks.filter(t => t.title.trim() !== '');
            if (validTasks.length > 0) {
                await Promise.all(validTasks.map(task =>
                    ProjectService.createTask(project.id, {
                        title: task.title,
                        description: task.description,
                        status: 'TODO',
                        priority: 'MEDIUM'
                    })
                ));
            }

            router.push('/projects');
        } catch (error) {
            console.error("Failed to create project:", error);
            alert("Failed to create project. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/projects" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
                    <p className="text-muted-foreground mt-1">Define the goals and initial tasks for your agents.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Project Details */}
                <div className="glass-card p-6 rounded-xl space-y-4">
                    <h2 className="text-xl font-semibold border-b border-white/5 pb-2 mb-4">Project Details</h2>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Q1 Marketing Campaign"
                                className="w-full bg-secondary/30 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Describe the main objective..."
                                className="w-full bg-secondary/30 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Initial Tasks */}
                <div className="glass-card p-6 rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                        <h2 className="text-xl font-semibold">Initial Tasks</h2>
                        <button
                            onClick={addTask}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors font-medium"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Task
                        </button>
                    </div>

                    <div className="space-y-4">
                        {tasks.map((task, index) => (
                            <div key={index} className="flex gap-4 items-start p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex flex-col items-center gap-2 pt-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <input
                                        type="text"
                                        value={task.title}
                                        onChange={(e) => updateTask(index, 'title', e.target.value)}
                                        placeholder="Task Title"
                                        className="w-full bg-transparent border-0 border-b border-white/10 px-0 py-1 focus:ring-0 focus:border-primary placeholder:text-muted-foreground/50 font-medium"
                                    />
                                    <textarea
                                        value={task.description}
                                        onChange={(e) => updateTask(index, 'description', e.target.value)}
                                        rows={2}
                                        placeholder="Task Description..."
                                        className="w-full bg-transparent border-0 px-0 py-1 focus:ring-0 text-sm placeholder:text-muted-foreground/50 resize-none text-muted-foreground"
                                    />
                                </div>
                                <button
                                    onClick={() => removeTask(index)}
                                    className="p-2 text-muted-foreground bg-transparent hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {tasks.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-white/5 rounded-lg">
                                No tasks defined. Add tasks to guide your agents.
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Link href="/projects" className="px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                        Cancel
                    </Link>
                    <button
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isLoading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </div>
        </div>
    );
}
