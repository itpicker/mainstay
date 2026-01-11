'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Agent } from '@/lib/types';

interface AddAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (agentData: { name: string; role: string; capabilities: string[] }) => Promise<void>;
}

export function AddAgentModal({ isOpen, onClose, onSave }: AddAgentModalProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('DEVELOPER');
    const [capabilitiesInput, setCapabilitiesInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const capabilities = capabilitiesInput.split(',').map(c => c.trim()).filter(Boolean);
            await onSave({ name, role, capabilities });
            onClose();
            // Reset form
            setName('');
            setRole('DEVELOPER');
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
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="MANAGER">Manager</option>
                            <option value="DEVELOPER">Developer</option>
                            <option value="RESEARCHER">Researcher</option>
                            <option value="DESIGNER">Designer</option>
                            <option value="TESTER">Tester</option>
                        </select>
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
