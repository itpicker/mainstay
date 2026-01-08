'use client';

import { X, Save, Bot, Terminal, Shield, Cpu } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AgentRole } from '@/lib/types';

interface NodeInspectorProps {
    node: Node | null;
    onClose: () => void;
    onUpdate: (nodeId: string, data: any) => void;
}

const ROLES: { value: AgentRole; label: string }[] = [
    { value: 'MANAGER', label: 'Project Manager' },
    { value: 'RESEARCHER', label: 'Researcher' },
    { value: 'DESIGNER', label: 'Designer' },
    { value: 'DEVELOPER', label: 'Developer' },
    { value: 'REVIEWER', label: 'Reviewer' },
];

const MODELS = [
    { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gemini-1-5-pro', label: 'Gemini 1.5 Pro' },
];

const AVAILABLE_TOOLS = [
    { id: 'git', label: 'Git Control', icon: Terminal },
    { id: 'browser', label: 'Web Browser', icon: Bot },
    { id: 'fs', label: 'File System', icon: Cpu },
    { id: 'deploy', label: 'Deployment', icon: Shield },
];

export function NodeInspector({ node, onClose, onUpdate }: NodeInspectorProps) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (node) {
            setFormData({
                label: node.data.label || '',
                role: node.data.role || 'DEVELOPER',
                model: node.data.model || 'claude-3-5-sonnet',
                persona: node.data.persona || '',
                responsibilities: node.data.responsibilities || '',
                tools: node.data.tools || [],
            });
        }
    }, [node]);

    if (!node) return null;

    const handleChange = (field: string, value: any) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onUpdate(node.id, newData);
    };

    const toggleTool = (toolId: string) => {
        const currentTools = formData.tools || [];
        const newTools = currentTools.includes(toolId)
            ? currentTools.filter((t: string) => t !== toolId)
            : [...currentTools, toolId];
        handleChange('tools', newTools);
    };

    return (
        <div className="w-80 border-l border-white/10 bg-card/95 backdrop-blur-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-400" />
                    <h2 className="font-bold text-sm">Agent Configuration</h2>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Identity Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Identity</h3>

                    <div className="space-y-1">
                        <label className="text-xs font-medium">Agent Name</label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                            placeholder="e.g. Frontend Lead"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                        >
                            {ROLES.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium">AI Model</label>
                        <select
                            value={formData.model}
                            onChange={(e) => handleChange('model', e.target.value)}
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                        >
                            {MODELS.map(model => (
                                <option key={model.value} value={model.value}>{model.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Behavior Section */}
                <div className="space-y-3 border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Behavior & Persona</h3>

                    <div className="space-y-1">
                        <label className="text-xs font-medium">System Prompt / Persona</label>
                        <textarea
                            value={formData.persona}
                            onChange={(e) => handleChange('persona', e.target.value)}
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50 transition-colors min-h-[100px] resize-y"
                            placeholder="Describe how this agent should behave. E.g. 'Strictly follows clean code principles, always adds comments, prefers functional programming.'"
                        />
                    </div>
                </div>

                {/* Capabilities Section */}
                <div className="space-y-3 border-t border-white/5 pt-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Capabilities</h3>

                    <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_TOOLS.map(tool => {
                            const isEnabled = (formData.tools || []).includes(tool.id);
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => toggleTool(tool.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs transition-all",
                                        isEnabled
                                            ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                            : "bg-secondary/30 border-white/5 text-muted-foreground hover:bg-secondary/50"
                                    )}
                                >
                                    <tool.icon className="h-4 w-4" />
                                    {tool.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-secondary/20 shrink-0">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Updates auto-saved
                </div>
            </div>
        </div>
    );
}
