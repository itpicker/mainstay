'use client';

import { useState } from 'react';
import { Agent } from '@/lib/types';
import { Bot, Shield, Terminal, Plus, UserCircle, Trash2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectTeamProps {
    agents: Agent[];
    onUpdateAgent: (agent: Agent) => void;
    onRemoveAgent?: (agentId: string) => void;
    onMessage?: (agent: Agent) => void;
    onAddAgent?: () => void;
    onEditAgent?: (agent: Agent) => void;
}

export function ProjectTeam({ agents, onUpdateAgent, onRemoveAgent, onMessage, onAddAgent, onEditAgent }: ProjectTeamProps) {

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Project Team</h2>
                    <p className="text-sm text-muted-foreground">Manage agents assigned to this project and their autonomy levels.</p>
                </div>
                {onAddAgent && (
                    <button
                        onClick={onAddAgent}
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Agent
                    </button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                    <div key={agent.id} className="glass-card p-6 rounded-xl flex flex-col relative overflow-hidden group border border-white/5 hover:border-white/10 transition-colors">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            {agent.role === 'MANAGER' && <Shield className="h-32 w-32 -rotate-12 translate-x-8 -translate-y-8" />}
                            {agent.role === 'DEVELOPER' && <Terminal className="h-32 w-32 -rotate-12 translate-x-8 -translate-y-8" />}
                            {agent.role === 'RESEARCHER' && <Bot className="h-32 w-32 -rotate-12 translate-x-8 -translate-y-8" />}
                        </div>

                        {/* Header */}
                        <div className="relative z-10 flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border border-white/10 shadow-sm">
                                    <UserCircle className="h-6 w-6 text-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base">{agent.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-primary font-medium px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                                            {agent.role}
                                        </span>
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            agent.status === 'IDLE' ? "bg-green-500" :
                                                agent.status === 'BUSY' ? "bg-orange-500 animate-pulse" : "bg-red-500"
                                        )} />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 items-start">
                                <button
                                    onClick={() => onMessage?.(agent)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                                    title="Direct Message"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                                {onEditAgent && (
                                    <button
                                        onClick={() => onEditAgent(agent)}
                                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Edit Agent"
                                    >
                                        <Bot className="h-4 w-4" /> {/* Or Pencil icon, verifying imports... Bot is imported. */}
                                    </button>
                                )}
                                {onRemoveAgent && (
                                    <button
                                        onClick={() => onRemoveAgent(agent.id)}
                                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Validated Capabilities */}
                        <div className="space-y-2 mb-6 relative z-10 min-h-[3rem]">
                            <div className="flex flex-wrap gap-1">
                                {agent.capabilities.slice(0, 3).map(cap => (
                                    <span key={cap} className="px-2 py-0.5 rounded text-[10px] bg-secondary/50 border border-white/5 text-muted-foreground">
                                        {cap}
                                    </span>
                                ))}
                                {agent.capabilities.length > 3 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-secondary/50 border border-white/5 text-muted-foreground">
                                        +{agent.capabilities.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Project Autonomy Control */}
                        <div className="relative z-10 mt-auto pt-4 border-t border-white/5 space-y-3 bg-black/20 -mx-6 -mb-6 p-6">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground uppercase tracking-wide">Project Autonomy</span>
                                <span className={cn(
                                    "font-bold px-2 py-0.5 rounded border text-[10px] shadow-sm transition-colors",
                                    (agent.autonomyLevel || 3) <= 2 ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                        (agent.autonomyLevel || 3) <= 3 ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            (agent.autonomyLevel || 3) <= 4 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                )}>
                                    Level {agent.autonomyLevel || 3}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={agent.autonomyLevel || 3}
                                onChange={(e) => onUpdateAgent({ ...agent, autonomyLevel: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:bg-white/20 transition-colors"
                            />

                            <div className="text-[10px] text-muted-foreground text-center font-medium">
                                {(agent.autonomyLevel || 3) === 1 && "Assistant (Safe Mode)"}
                                {(agent.autonomyLevel || 3) === 2 && "Junior (Draft Only)"}
                                {(agent.autonomyLevel || 3) === 3 && "Senior (Collaborator)"}
                                {(agent.autonomyLevel || 3) === 4 && "Lead (Delegate)"}
                                {(agent.autonomyLevel || 3) === 5 && "Autonomous (Unsupervised)"}
                            </div>
                        </div>
                    </div>
                ))
                }
            </div >
        </div >
    );
}
