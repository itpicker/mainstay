'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Agent } from '@/lib/types';

// Basic Role-based Goals (User Layer)
const ROLE_TEMPLATES: Record<string, string> = {
    MANAGER: "Manage project timelines, allocate resources, and ensure milestones are met on schedule.",
    DEVELOPER: "Write clean, efficient, and well-documented code. Focus on scalability and maintainability.",
    RESEARCHER: "Analyze requirements, research technologies, and provide data-driven insights.",
    DESIGNER: "Create intuitive, user-friendly interfaces and ensure consistent design patterns.",
    TESTER: "Execute test plans, identify bugs, and ensure quality standards are met."
};

interface AddAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (agentData: { name: string; role: string; capabilities: string[]; model?: string; goal?: string }) => Promise<void>;
}

export function AddAgentModal({ isOpen, onClose, onSave }: AddAgentModalProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('DEVELOPER');
    const [customRole, setCustomRole] = useState('');
    const [isCustomRole, setIsCustomRole] = useState(false);
    const [model, setModel] = useState('');
    const [goal, setGoal] = useState(ROLE_TEMPLATES['DEVELOPER']); // Default
    const [capabilitiesInput, setCapabilitiesInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);

        // Auto-fill goal if it matches a previous template or is empty
        const isStandardRole = newRole in ROLE_TEMPLATES;
        if (isStandardRole) {
            setGoal(ROLE_TEMPLATES[newRole]);
        } else if (newRole === 'CUSTOM') {
            // Keep existing or clear? Let's keep existing to be safe
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const finalRole = isCustomRole ? customRole : role;
            const capabilities = capabilitiesInput.split(',').map(c => c.trim()).filter(Boolean);
            await onSave({
                name,
                role: finalRole,
                capabilities,
                model: model || undefined,
                goal: goal || undefined
            });
            onClose();
            // Reset form
            setName('');
            setRole('DEVELOPER');
            setCustomRole('');
            setIsCustomRole(false);
            setModel('');
            setGoal(ROLE_TEMPLATES['DEVELOPER']);
            setCapabilitiesInput('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in zoom-in-50 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Add New Agent</h2>
                    <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Agent Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Omega-Test"
                            className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                        {!isCustomRole ? (
                            <div className="flex gap-2">
                                <select
                                    value={role}
                                    onChange={(e) => {
                                        if (e.target.value === 'CUSTOM') {
                                            setIsCustomRole(true);
                                            setCustomRole('');
                                            setGoal(''); // Reset for custom
                                        } else {
                                            handleRoleChange(e.target.value);
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="MANAGER">Manager</option>
                                    <option value="DEVELOPER">Developer</option>
                                    <option value="RESEARCHER">Researcher</option>
                                    <option value="DESIGNER">Designer</option>
                                    <option value="TESTER">Tester</option>
                                    <option value="CUSTOM">+ Custom Role</option>
                                </select>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    placeholder="Enter custom role..."
                                    className="flex-1 px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    autoFocus
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomRole(false);
                                        handleRoleChange('DEVELOPER'); // Reset to default
                                    }}
                                    className="px-3 py-2 text-xs bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Goal / Instructions <span className="text-xs text-muted-foreground font-normal">(Visible Persona)</span>
                        </label>
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Describe what this agent should focus on..."
                            className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Model (Optional)</label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="e.g. gpt-4-turbo, claude-3-opus"
                            className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-muted-foreground">Leave empty to use system default.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Capabilities (comma separated)</label>
                        <input
                            type="text"
                            value={capabilitiesInput}
                            onChange={(e) => setCapabilitiesInput(e.target.value)}
                            placeholder="e.g. python, react, sql"
                            className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Create Agent
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
