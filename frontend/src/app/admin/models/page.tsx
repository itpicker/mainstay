'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, Server, Bot } from 'lucide-react';
import { AdminService, AIModel } from '@/lib/api/admin';

export default function AdminModelsPage() {
    const [models, setModels] = useState<AIModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Model Form State
    const [newName, setNewName] = useState('');
    const [newModelId, setNewModelId] = useState('');
    const [newProvider, setNewProvider] = useState('OPENAI');
    const [newApiKey, setNewApiKey] = useState('');
    const [newBaseUrl, setNewBaseUrl] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const data = await AdminService.getAllModels();
            setModels(data);
        } catch (error) {
            console.error("Failed to load models:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateModel = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newModel = await AdminService.createModel({
                name: newName,
                model_id: newModelId,
                provider: newProvider,
                api_key: newApiKey || undefined,
                base_url: newBaseUrl || undefined
            });
            setModels([...models, newModel]);
            setIsFormOpen(false);
            setNewName('');
            setNewModelId('');
            setNewProvider('OPENAI');
            setNewApiKey('');
            setNewBaseUrl('');
        } catch (error) {
            console.error("Failed to create model:", error);
            alert("Failed to create model");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteModel = async (id: string) => {
        if (!confirm('Are you sure you want to delete this model?')) return;
        try {
            await AdminService.deleteModel(id);
            setModels(models.filter(m => m.id !== id));
        } catch (error) {
            console.error("Failed to delete model:", error);
            alert("Failed to delete model");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Server className="h-8 w-8 text-primary" />
                        AI Models Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage the AI models available for agents.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Model
                </button>
            </div>

            {/* Add Model Form */}
            {isFormOpen && (
                <div className="mb-8 p-6 bg-secondary/30 border border-border rounded-xl animate-in slide-in-from-top-4 duration-200">
                    <h3 className="text-lg font-semibold mb-4">Register New Model</h3>
                    <form onSubmit={handleCreateModel} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. GPT-5 Alpha"
                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Model ID (API Key)</label>
                            <input
                                type="text"
                                value={newModelId}
                                onChange={(e) => setNewModelId(e.target.value)}
                                placeholder="e.g. gpt-5-alpha-001"
                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Provider</label>
                            <select
                                value={newProvider}
                                onChange={(e) => setNewProvider(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="OPENAI">OpenAI</option>
                                <option value="ANTHROPIC">Anthropic</option>
                                <option value="OLLAMA">Ollama</option>
                                <option value="GOOGLE">Google</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">API Key (Optional)</label>
                            <input
                                type="password"
                                value={newApiKey}
                                onChange={(e) => setNewApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Base URL (For Ollama etc.)</label>
                            <input
                                type="text"
                                value={newBaseUrl}
                                onChange={(e) => setNewBaseUrl(e.target.value)}
                                placeholder="e.g. http://localhost:11434"
                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 h-[42px]"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Model'}
                        </button>
                    </form>
                </div>
            )}

            {/* Models Table */}
            <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-secondary/50 border-b border-border text-muted-foreground">
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Model ID</th>
                            <th className="px-6 py-4 font-medium">Provider</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Loading models...
                                </td>
                            </tr>
                        ) : models.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    No models configured. Add one to get started.
                                </td>
                            </tr>
                        ) : (
                            models.map((model) => (
                                <tr key={model.id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        {model.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{model.model_id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium border
                                            ${model.provider === 'OPENAI' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                model.provider === 'ANTHROPIC' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                    model.provider === 'OLLAMA' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}
                                        >
                                            {model.provider}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {model.is_active ? (
                                            <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteModel(model.id)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Model"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
