import { X, Save, Bot, Terminal, Shield, Cpu, User, Wrench, BookOpen, Plus, Sparkles } from 'lucide-react';
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
    { id: 'git', label: 'Git Control', icon: Terminal, description: 'Read/Write access to repository' },
    { id: 'browser', label: 'Web Browser', icon: Bot, description: 'External search capability' },
    { id: 'fs', label: 'File System', icon: Cpu, description: 'Ability to create/edit files' },
    { id: 'deploy', label: 'Deployment', icon: Shield, description: 'Permission to deploy to environments' },
];

const DEFAULT_SKILLS = [
    { id: 'code-review', label: 'Code Style Review', description: 'Check against style guide' },
    { id: 'unit-test', label: 'Gen. Unit Tests', description: 'Create tests for new code' },
    { id: 'doc-gen', label: 'Doc Generator', description: 'Write TSDoc comments' },
];

type ActiveTab = 'PERSONA' | 'TOOLS' | 'SKILLS';

export function NodeInspector({ node, onClose, onUpdate }: NodeInspectorProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('PERSONA');
    const [formData, setFormData] = useState<any>({});
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (node) {
            setFormData({
                label: node.data.label || '',
                role: node.data.role || 'DEVELOPER',
                model: node.data.model || 'claude-3-5-sonnet',
                persona: node.data.persona || '',
                knowledge: node.data.knowledge || [], // ['React', 'Next.js']
                tools: node.data.tools || [],
                skills: node.data.skills || [], // ['code-review']
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

    const toggleSkill = (skillId: string) => {
        const currentSkills = formData.skills || [];
        const newSkills = currentSkills.includes(skillId)
            ? currentSkills.filter((s: string) => s !== skillId)
            : [...currentSkills, skillId];
        handleChange('skills', newSkills);
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            const newTags = [...(formData.knowledge || []), tagInput.trim()];
            handleChange('knowledge', newTags);
            setTagInput('');
        }
    };

    const removeTag = (tagIdx: number) => {
        const newTags = formData.knowledge.filter((_: any, idx: number) => idx !== tagIdx);
        handleChange('knowledge', newTags);
    };

    const TabButton = ({ id, icon: Icon, label }: { id: ActiveTab, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors border-b-2",
                activeTab === id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );

    return (
        <div className="w-96 border-l border-white/10 bg-card/95 backdrop-blur-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-secondary/20">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-400" />
                    <h2 className="font-bold text-sm">Agent Configuration</h2>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-black/20">
                <TabButton id="PERSONA" icon={User} label="Persona" />
                <TabButton id="TOOLS" icon={Wrench} label="Tools" />
                <TabButton id="SKILLS" icon={BookOpen} label="Skills" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">

                {/* TAB 1: PERSONA */}
                {activeTab === 'PERSONA' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Identity</label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => handleChange('label', e.target.value)}
                                    className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 transition-colors"
                                    placeholder="Agent Name"
                                />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select
                                        value={formData.role}
                                        onChange={(e) => handleChange('role', e.target.value)}
                                        className="bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-xs"
                                    >
                                        {ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
                                    </select>
                                    <select
                                        value={formData.model}
                                        onChange={(e) => handleChange('model', e.target.value)}
                                        className="bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-xs"
                                    >
                                        {MODELS.map(model => <option key={model.value} value={model.value}>{model.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Expertise Tags (Knowledge)</label>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {formData.knowledge?.map((tag: string, idx: number) => (
                                        <span key={idx} className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border border-blue-500/30">
                                            {tag}
                                            <button onClick={() => removeTag(idx)} className="hover:text-white"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={addTag}
                                    className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-blue-500/50"
                                    placeholder="Add skill tag (Press Enter)... e.g. React"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">System Prompt / Body</label>
                                <textarea
                                    value={formData.persona}
                                    onChange={(e) => handleChange('persona', e.target.value)}
                                    className="w-full bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-xs min-h-[150px] resize-y leading-relaxed"
                                    placeholder="Define the agent's personality, tone, and specific behavioral guidelines..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: TOOLS */}
                {activeTab === 'TOOLS' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded mb-4">
                            Capabilities define what this agent can physically do in the system.
                        </div>
                        {AVAILABLE_TOOLS.map(tool => {
                            const isEnabled = (formData.tools || []).includes(tool.id);
                            return (
                                <div key={tool.id} className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                                    isEnabled ? "bg-blue-500/10 border-blue-500/30" : "bg-card border-white/5 opacity-80"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-md", isEnabled ? "bg-blue-500/20 text-blue-400" : "bg-secondary text-muted-foreground")}>
                                            <tool.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{tool.label}</div>
                                            <div className="text-[10px] text-muted-foreground">{tool.description}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleTool(tool.id)}
                                        className={cn(
                                            "w-10 h-5 rounded-full relative transition-colors",
                                            isEnabled ? "bg-blue-500" : "bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                            isEnabled ? "left-5.5" : "left-0.5"
                                        )} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* TAB 3: SKILLS */}
                {activeTab === 'SKILLS' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold uppercase text-muted-foreground">Standard Procedures</h3>
                            <button className="text-[10px] flex items-center gap-1 bg-secondary hover:bg-white/10 px-2 py-1 rounded transition-colors">
                                <Plus className="h-3 w-3" /> New Skill
                            </button>
                        </div>

                        <div className="space-y-2">
                            {DEFAULT_SKILLS.map(skill => {
                                const isActive = (formData.skills || []).includes(skill.id);
                                return (
                                    <div
                                        key={skill.id}
                                        onClick={() => toggleSkill(skill.id)}
                                        className={cn(
                                            "p-3 rounded-lg border cursor-pointer hover:border-blue-500/50 transition-all group",
                                            isActive
                                                ? "bg-blue-500/5 border-blue-500/50"
                                                : "bg-card border-white/5"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className={cn("h-3.5 w-3.5", isActive ? "text-blue-400" : "text-muted-foreground")} />
                                                <span className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                                                    {skill.label}
                                                </span>
                                            </div>
                                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground mt-1 ml-5.5">
                                            {skill.description}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-secondary/20 shrink-0 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Auto-saved
                </div>
            </div>
        </div>
    );
}
