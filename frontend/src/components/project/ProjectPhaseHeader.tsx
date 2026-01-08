'use client';

import { Project } from '@/lib/types';
import { Lock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/lib/date';
import { WorkflowVisualizer } from './WorkflowVisualizer';
import { WorkflowStageId, WorkflowEngine } from '@/lib/workflow';

interface ProjectPhaseHeaderProps {
    project: Project;
    onFreezePlanning: () => void;
    onRequestChange: () => void;
}

export function ProjectPhaseHeader({ project, onFreezePlanning, onRequestChange }: ProjectPhaseHeaderProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const isPlanning = project.lifecycle === 'PLANNING';
    // Fallback to REQUIREMENTS if no stage is set
    const currentStage = (project.workflowStage as WorkflowStageId) || 'REQUIREMENTS';

    // Get ordered stages based on template
    const stages = WorkflowEngine.getOrderedStages(project.workflowTemplateId);

    return (
        <div className="bg-secondary/20 border-b border-white/5 pt-6 pb-2 px-4">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">

                {/* Visual Workflow Stepper */}
                <div className="w-full overflow-x-auto">
                    <WorkflowVisualizer stages={stages} currentStage={currentStage} />
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="text-xs text-muted-foreground">
                        Current Strict Phase: <span className="font-bold text-foreground">{currentStage}</span>
                    </div>

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
        </div>
    );
}
