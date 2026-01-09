'use client';

import { useState } from 'react';
import { User, Settings, Bell, CreditCard, Cpu, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'general' | 'ai' | 'notifications' | 'billing';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Mock State
    const [general, setGeneral] = useState({
        name: 'Admin User',
        email: 'admin@mainstay.ai',
        workspaceName: 'Toss Design Team',
    });

    const [aiConfig, setAiConfig] = useState({
        defaultModel: 'gpt-4',
        temperature: 0.7,
        autonomyLevel: 3, // Level 1-5
        openaiKey: 'sk-........................',
        anthropicKey: '',
    });

    const [notifications, setNotifications] = useState({
        email: true,
        slack: false,
        inApp: true,
        events: {
            taskCompleted: true,
            reviewRequested: true,
            errorOccurred: true,
        }
    });

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: User },
        { id: 'ai', label: 'AI & Models', icon: Cpu },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    ];

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Settings className="h-6 w-6 text-muted-foreground" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage workspace preferences and AI configuration.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all",
                        saved
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {saved ? (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            {isSaving ? (
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as SettingsTab)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left",
                                activeTab === tab.id
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-secondary/10 rounded-xl border border-white/5 p-6 lg:p-8 overflow-y-auto">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-lg font-semibold border-b border-white/5 pb-4">Profile & Workspace</h2>

                            <div className="grid gap-4 max-w-xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                                    <input
                                        type="text"
                                        value={general.name}
                                        onChange={(e) => setGeneral({ ...general, name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <input
                                        type="email"
                                        value={general.email}
                                        disabled
                                        className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2 text-sm text-muted-foreground cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                                </div>
                                <div className="pt-4 border-t border-white/5 mt-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Workspace Name</label>
                                        <input
                                            type="text"
                                            value={general.workspaceName}
                                            onChange={(e) => setGeneral({ ...general, workspaceName: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-lg font-semibold border-b border-white/5 pb-4">AI Configuration</h2>

                            {/* Model Selection */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-foreground">Default Model</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'].map((model) => (
                                        <button
                                            key={model}
                                            onClick={() => setAiConfig({ ...aiConfig, defaultModel: model })}
                                            className={cn(
                                                "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                                                aiConfig.defaultModel === model
                                                    ? "bg-primary/10 border-primary shadow-sm"
                                                    : "bg-black/20 border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="font-medium text-sm mb-1">{model}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {model.includes('gpt-4') || model.includes('opus') ? 'High Intelligence' : 'Fast & Efficient'}
                                            </div>
                                            {aiConfig.defaultModel === model && (
                                                <div className="absolute top-2 right-2 text-primary">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Autonomy Level */}
                            <div className="space-y-4 pt-4 border-t border-white/5 relative">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground">Default Organization Autonomy</label>
                                    <span className={cn(
                                        "text-sm font-bold px-2 py-0.5 rounded border",
                                        aiConfig.autonomyLevel <= 2 ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                            aiConfig.autonomyLevel <= 3 ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                aiConfig.autonomyLevel <= 4 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                    "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>
                                        Level {aiConfig.autonomyLevel}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={aiConfig.autonomyLevel}
                                    onChange={(e) => setAiConfig({ ...aiConfig, autonomyLevel: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                                    <span title="Assistant (Suggest Only)">L1</span>
                                    <span title="Junior (Draft & Review)">L2</span>
                                    <span title="Senior (Execute & Report)">L3</span>
                                    <span title="Lead (Goal-Oriented)">L4</span>
                                    <span title="Autonomous (Supervised)">L5</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="font-bold text-foreground">
                                        {aiConfig.autonomyLevel === 1 && "Level 1: Assistant - "}
                                        {aiConfig.autonomyLevel === 2 && "Level 2: Junior - "}
                                        {aiConfig.autonomyLevel === 3 && "Level 3: Senior - "}
                                        {aiConfig.autonomyLevel === 4 && "Level 4: Lead - "}
                                        {aiConfig.autonomyLevel === 5 && "Level 5: Autonomous - "}
                                    </span>
                                    {aiConfig.autonomyLevel === 1 && "Only suggests changes. Cannot edit files directly."}
                                    {aiConfig.autonomyLevel === 2 && "Can draft code but requires approval for everything."}
                                    {aiConfig.autonomyLevel === 3 && "Executes standard tasks. Asks before destructive actions."}
                                    {aiConfig.autonomyLevel === 4 && "Manages subtasks and coordinates other agents."}
                                    {aiConfig.autonomyLevel === 5 && "Full autonomy to monitor and fix issues proactively."}
                                </div>
                            </div>

                            {/* API Keys */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="text-sm font-medium text-foreground">API Keys</h3>
                                <div className="space-y-4 max-w-xl">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">OpenAI API Key</label>
                                        <input
                                            type="password"
                                            value={aiConfig.openaiKey}
                                            onChange={(e) => setAiConfig({ ...aiConfig, openaiKey: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono"
                                            placeholder="sk-..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Anthropic API Key</label>
                                        <input
                                            type="password"
                                            value={aiConfig.anthropicKey}
                                            onChange={(e) => setAiConfig({ ...aiConfig, anthropicKey: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono"
                                            placeholder="sk-ant-..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-lg font-semibold border-b border-white/5 pb-4">Notification Preferences</h2>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Channels</h3>
                                <div className="space-y-3">
                                    {[
                                        { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts.' },
                                        { id: 'slack', label: 'Slack Integration', desc: 'Get real-time updates in your team channel.' },
                                        { id: 'inApp', label: 'In-App Notifications', desc: 'Show toast popups while using the app.' },
                                    ].map((channel) => (
                                        <div key={channel.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                                            <div>
                                                <div className="font-medium text-sm">{channel.label}</div>
                                                <div className="text-xs text-muted-foreground">{channel.desc}</div>
                                            </div>
                                            <button
                                                onClick={() => setNotifications({ ...notifications, [channel.id]: !notifications[channel.id as keyof typeof notifications] })}
                                                className={cn(
                                                    "w-10 h-6 rounded-full transition-colors relative",
                                                    notifications[channel.id as keyof typeof notifications] ? "bg-primary" : "bg-white/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                                                    notifications[channel.id as keyof typeof notifications] ? "translate-x-4" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-lg font-semibold border-b border-white/5 pb-4">Billing & Usage</h2>

                            {/* Current Plan */}
                            <div className="bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="text-sm font-medium text-primary mb-1">Current Plan</div>
                                    <div className="text-3xl font-bold mb-2">Pro Team</div>
                                    <div className="text-sm text-muted-foreground mb-6">
                                        Unlimited agents, priority support, and 1M tokens/month.
                                    </div>
                                    <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                                        Upgrade Plan
                                    </button>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
                            </div>

                            {/* Usage Stats */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-medium text-foreground">Resource Usage</h3>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Monthly Tokens</span>
                                        <span className="font-medium">450k / 1M</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[45%]" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Storage</span>
                                        <span className="font-medium">2.1GB / 5GB</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[42%]" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Next billing date</span>
                                        <span className="font-mono">February 1, 2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
