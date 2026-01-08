'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChangeRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; impact: string }) => void;
}

export function ChangeRequestModal({ isOpen, onClose, onSubmit }: ChangeRequestModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [impact, setImpact] = useState('');

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

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, description, impact });
        onClose();
        setTitle('');
        setDescription('');
        setImpact('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[600px] bg-[#0E121B] border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-500" />
                            Submit Change Request
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Modifying a frozen plan requires a formal change request.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/5 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Warning */}
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex gap-3 text-orange-200">
                        <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-orange-400">Impact Warning</p>
                            <p className="opacity-80">Changing the plan during Execution may delay the deadline and introduce conflicts.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Request Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-secondary/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 text-white"
                                placeholder="e.g. Add Social Login Feature"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-32 bg-secondary/30 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 resize-none text-white"
                                placeholder="Describe the change in detail..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Impact Analysis (Optional)</label>
                            <textarea
                                value={impact}
                                onChange={(e) => setImpact(e.target.value)}
                                className="w-full h-24 bg-secondary/30 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 resize-none text-white"
                                placeholder="What is the expected impact on timeline or budget?"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-secondary/20 flex items-center justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !description.trim()}
                        className="px-6 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                    >
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    );
}
