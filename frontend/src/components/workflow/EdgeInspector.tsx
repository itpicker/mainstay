'use client';

import { X, ArrowRight, GitMerge, FileCheck, Lock } from 'lucide-react';
import { Edge } from '@xyflow/react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EdgeInspectorProps {
    edge: Edge | null;
    onClose: () => void;
    onUpdate: (edgeId: string, data: any) => void;
}

const CONNECTION_TYPES = [
    {
        id: 'BLOCKING',
        label: 'Blocking Dependency',
        description: 'Target task cannot start until source completes.',
        icon: Lock,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10'
    },
    {
        id: 'ASYNC',
        label: 'Async Handoff',
        description: 'Source sends data to target, but target runs independently.',
        icon: ArrowRight,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
    },
    {
        id: 'REVIEW',
        label: 'Review Request',
        description: 'Source submits work to target for approval/review.',
        icon: FileCheck,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10'
    },
];

export function EdgeInspector({ edge, onClose, onUpdate }: EdgeInspectorProps) {
    const [selectedType, setSelectedType] = useState<string>('BLOCKING');

    useEffect(() => {
        if (edge) {
            setSelectedType((edge.data?.connectionType as string) || 'BLOCKING');
        }
    }, [edge]);

    if (!edge) return null;

    const handleChange = (typeId: string) => {
        setSelectedType(typeId);
        onUpdate(edge.id, { connectionType: typeId });
    };

    return (
        <div className="w-80 border-l border-white/10 bg-card/95 backdrop-blur-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <GitMerge className="h-5 w-5 text-green-400" />
                    <h2 className="font-bold text-sm">Connection Logic</h2>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interaction Type</h3>

                    <div className="grid gap-3">
                        {CONNECTION_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => handleChange(type.id)}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                                    selectedType === type.id
                                        ? `border-white/20 ${type.bg} ring-1 ring-white/10`
                                        : "bg-secondary/20 border-white/5 hover:bg-secondary/40"
                                )}
                            >
                                <div className={cn("p-2 rounded-md bg-background/50", type.color)}>
                                    <type.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{type.label}</div>
                                    <div className="text-[10px] text-muted-foreground mt-1 leading-snug">
                                        {type.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-xs">
                    <strong>Note:</strong> Changing connection type alters the Orchestrator's behavior for this workflow step.
                </div>
            </div>

            <div className="p-4 text-[10px] text-muted-foreground text-center border-t border-white/5">
                Edge ID: {edge.id}
            </div>
        </div>
    );
}
