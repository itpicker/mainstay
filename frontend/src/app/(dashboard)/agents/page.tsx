'use client';

import { Bot, User, Power, Terminal, Shield } from 'lucide-react';
import { Agent } from '@/lib/types';

// Mock Agents
const mockAgents: Agent[] = [
    { id: '1', name: 'Alpha-1', role: 'MANAGER', status: 'BUSY', capabilities: ['Project Planning', 'Task Delegation'] },
    { id: '2', name: 'Beta-Dev', role: 'DEVELOPER', status: 'IDLE', capabilities: ['React', 'Node.js', 'Python'] },
    { id: '3', name: 'Gamma-Res', role: 'RESEARCHER', status: 'IDLE', capabilities: ['Web Search', 'Data Analysis'] },
    { id: '4', name: 'Delta-Des', role: 'DESIGNER', status: 'OFFLINE', capabilities: ['UI/UX', 'Figma', 'CSS'] },
];

export default function AgentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Agent Fleet</h1>
                <p className="text-muted-foreground mt-1">Available agent templates for your projects.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {mockAgents.map((agent) => (
                    <div key={agent.id} className="glass-card p-6 rounded-xl flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            {agent.role === 'MANAGER' && <Shield className="h-24 w-24 text-primary/10 -rotate-12 translate-x-4 -translate-y-4" />}
                            {agent.role === 'DEVELOPER' && <Terminal className="h-24 w-24 text-primary/10 -rotate-12 translate-x-4 -translate-y-4" />}
                        </div>

                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center border border-white/10">
                                <Bot className="h-6 w-6 text-foreground" />
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold border ${agent.status === 'IDLE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                agent.status === 'BUSY' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                {agent.status}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold relative z-10">{agent.name}</h3>
                        <p className="text-xs text-primary font-medium mb-4 relative z-10">{agent.role}</p>

                        <div className="space-y-2 mb-6 relative z-10">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Capabilities</p>
                            <div className="flex flex-wrap gap-1.5">
                                {agent.capabilities.map(cap => (
                                    <span key={cap} className="px-2 py-0.5 rounded text-[10px] bg-secondary border border-white/5">
                                        {cap}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button className="mt-auto pt-4 border-t border-white/5 w-full py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors relative z-10">
                            View Details
                        </button>
                    </div>
                ))}

                {/* Add Agent Card */}
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlusIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Deploy New Agent</h3>
                    <p className="text-xs text-muted-foreground mt-1">Configure a new specialized agent</p>
                </div>
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
