'use client';

import { Check, Lock } from 'lucide-react';
import { WorkflowStageDefinition, WorkflowStageId } from '@/lib/workflow';
import { cn } from '@/lib/utils';

interface WorkflowVisualizerProps {
    stages: WorkflowStageDefinition[];
    currentStage: WorkflowStageId;
    onStageClick?: (stageId: WorkflowStageId) => void;
}

export function WorkflowVisualizer({ stages, currentStage, onStageClick }: WorkflowVisualizerProps) {
    const mainStages = stages.filter(s => s.id !== 'COMPLETED');
    const currentIndex = mainStages.findIndex(s => s.id === currentStage);

    // If current stage is COMPLETED, then all main stages are done
    // If currentStage is not found (e.g. COMPLETED or invalid), currentIndex is -1.
    // If completed, we want effectiveIndex to be length.
    const effectiveIndex = currentStage === 'COMPLETED' ? mainStages.length : currentIndex;

    return (
        <div className="flex items-center w-full overflow-x-auto pb-4">
            {mainStages.map((stage, index) => {
                const isActive = stage.id === currentStage;
                const isCompleted = index < effectiveIndex;
                const isLocked = index > effectiveIndex;

                return (
                    <div key={stage.id} className="flex items-center shrink-0">
                        {/* Stage Node */}
                        <div
                            onClick={() => onStageClick?.(stage.id)}
                            className={cn(
                                "relative flex flex-col items-center gap-2 cursor-pointer group w-40",
                                isLocked ? "pointer-events-none opacity-50" : ""
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 bg-background",
                                isActive ? "border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110" :
                                    isCompleted ? "border-green-500 bg-green-500/10 text-green-500" :
                                        "border-white/10 text-muted-foreground"
                            )}>
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : isLocked ? (
                                    <Lock className="h-4 w-4" />
                                ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                )}
                            </div>

                            <div className="text-center">
                                <div className={cn("text-xs font-bold mb-0.5", isActive ? "text-primary" : "text-muted-foreground")}>
                                    {stage.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground/60 max-w-[120px] mx-auto leading-tight hidden group-hover:block transition-all animate-in fade-in slide-in-from-top-1 absolute top-full mt-2 bg-black/80 px-2 py-1 rounded backdrop-blur-md border border-white/5 z-20">
                                    {stage.description}
                                </div>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < mainStages.length - 1 && (
                            <div className="h-[2px] w-12 bg-white/5 mx-2 relative">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-500/50 transition-all duration-1000"
                                    style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
