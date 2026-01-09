'use client';

import { Project } from '@/lib/types';
import { Lock, AlertTriangle, Play, Pause, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/lib/date';
import { WorkflowVisualizer } from './WorkflowVisualizer';
import { WorkflowStageId, WorkflowEngine } from '@/lib/workflow';

export function ProjectPhaseHeader({ project, onToggleActivity }: { project: Project; onToggleActivity: () => void }) {
    // Get ordered stages based on template
    const stages = WorkflowEngine.getOrderedStages(project.workflowTemplateId);
    const currentStage = (project.workflowStage as WorkflowStageId) || 'REQUIREMENTS';

    return (
        <div className="bg-secondary/20 border-b border-white/5 pt-6 pb-2 px-4">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">

                {/* Visual Workflow Stepper */}
                <div className="w-full overflow-x-auto">
                    <WorkflowVisualizer stages={stages} currentStage={currentStage} />
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-muted-foreground">
                            Current Stage: <span className="font-bold text-foreground">{currentStage}</span>
                        </div>
                        {project.isAgentsActive ? (
                            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Agents Working
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                Operations Paused
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {project.isAgentsActive ? (
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Lock className="h-3 w-3" /> Plan Locked
                                </span>
                                <button
                                    onClick={onToggleActivity}
                                    className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded-lg transition-colors text-xs font-medium flex items-center gap-2"
                                >
                                    <Pause className="h-3.5 w-3.5" />
                                    Pause Agents
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Edit3 className="h-3 w-3" /> Editing Enabled
                                </span>
                                <button
                                    onClick={onToggleActivity}
                                    className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg transition-colors text-xs font-medium flex items-center gap-2"
                                >
                                    <Play className="h-3.5 w-3.5" />
                                    Resume Operations
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
