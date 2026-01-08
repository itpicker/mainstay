'use client';

import { Project, ProjectLifecycle } from '@/lib/types';
import { Lock, Unlock, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date';

interface ProjectPhaseHeaderProps {
    project: Project;
    onFreezePlanning: () => void;
    onRequestChange: () => void;
}

export function ProjectPhaseHeader({ project, onFreezePlanning, onRequestChange }: ProjectPhaseHeaderProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const isPlanning = project.lifecycle === 'PLANNING';
    const isFrozen = project.isPlanningFrozen;

    return (
        <div className="bg-secondary/20 border-b border-white/5 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Phase Stepper */}
                <div className="flex items-center gap-4">
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        isPlanning ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" : "text-muted-foreground opacity-50")}>
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-current text-[10px] text-black font-bold">1</span>
                        Definition (Planning)
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground/30" />

                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        !isPlanning ? "bg-green-500/20 text-green-500 border border-green-500/30" : "text-muted-foreground opacity-50")}>
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-current text-[10px] text-black font-bold">2</span>
                        Execution (Dev)
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {isPlanning ? (
                        <div className="flex items-center gap-2">
                            {showConfirm ? (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <span className="text-xs text-orange-400 flex items-center gap-1 font-medium bg-orange-500/10 px-2 py-1 rounded">
                                        <AlertTriangle className="h-3 w-3" />
                                        Confirm Freeze?
                                    </span>
                                    <button
                                        onClick={onFreezePlanning}
                                        className="btn-primary text-xs px-3 py-1.5 h-auto bg-orange-500 hover:bg-orange-600 border-orange-400"
                                    >
                                        Yes, Freeze Plan
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <Lock className="h-3.5 w-3.5" />
                                    Sign-off & Freeze Planning
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onRequestChange}
                                className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Request Change
                            </button>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
                                    <Lock className="h-3.5 w-3.5" />
                                    Planning Frozen
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    on {formatDate(project.planningFrozenAt)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
