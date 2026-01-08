import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Code, Terminal, Shield, Search, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentRole } from '@/lib/types';

const roleIcons: Record<AgentRole, any> = {
    MANAGER: Shield,
    DEVELOPER: Code,
    RESEARCHER: Search,
    DESIGNER: PenTool,
    REVIEWER: Terminal,
};

const roleColors: Record<AgentRole, string> = {
    MANAGER: 'from-blue-500 to-indigo-600',
    DEVELOPER: 'from-emerald-500 to-teal-600',
    RESEARCHER: 'from-orange-500 to-amber-600',
    DESIGNER: 'from-pink-500 to-rose-600',
    REVIEWER: 'from-purple-500 to-violet-600',
};

export default memo(function AgentNode({ data }: { data: { label: string; role: AgentRole; status?: string } }) {
    const Icon = roleIcons[data.role] || Bot;
    const gradient = roleColors[data.role] || 'from-gray-500 to-slate-600';

    return (
        <div className={cn(
            "px-4 py-3 rounded-xl shadow-lg border border-white/10 min-w-[200px] bg-card/80 backdrop-blur-md",
            "transition-all duration-200 hover:ring-2 hover:ring-primary/50 hover:shadow-xl"
        )}>
            <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-3 !h-3 !-top-1.5" />

            <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shadow-inner text-white bg-gradient-to-br", gradient)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm font-bold text-foreground">{data.label}</div>
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{data.role}</div>
                </div>
            </div>

            {data.status && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Status</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground")}>
                        {data.status}
                    </span>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-3 !h-3 !-bottom-1.5" />
        </div>
    );
});
