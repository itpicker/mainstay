'use client';

import { Artifact } from '@/lib/types';
import {
    FileText, FileCode, Image as ImageIcon, Archive, Globe,
    ExternalLink, Download, Play, Github, Box, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date';

interface DeliverableCardProps {
    artifact: Artifact;
    taskTitle?: string;
}

export function DeliverableCard({ artifact, taskTitle }: DeliverableCardProps) {
    const isDeployment = artifact.type === 'DEPLOYMENT';

    const getIcon = () => {
        switch (artifact.type) {
            case 'CODE': return FileCode;
            case 'DOCUMENT': return FileText;
            case 'IMAGE': return ImageIcon;
            case 'ARCHIVE': return Archive;
            case 'DEPLOYMENT': return Globe;
            default: return FileText;
        }
    };

    const Icon = getIcon();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ONLINE': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'READY': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'FAILED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'OFFLINE': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
            default: return 'text-muted-foreground bg-secondary border-white/5';
        }
    };

    if (isDeployment) {
        return (
            <div className="glass-card p-0 rounded-xl overflow-hidden group border border-white/10 hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                <div className="p-5 flex items-start justify-between bg-gradient-to-br from-background/50 to-secondary/20">
                    <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-xl", getStatusColor(artifact.status))}>
                            <Globe className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-base">{artifact.name}</h4>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", getStatusColor(artifact.status))}>
                                    {artifact.status}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{artifact.metadata?.environment} • {artifact.metadata?.version}</p>
                            {artifact.metadata?.testStatus && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded w-fit">
                                    {artifact.metadata.testStatus === 'PASS' ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    ) : artifact.metadata.testStatus === 'FAIL' ? (
                                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                                    ) : (
                                        <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                                    )}
                                    Automated Tests: {artifact.metadata.testStatus}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-secondary/10 border-t border-white/5 flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                        Last detailed check: <span className="text-foreground">{formatDate(artifact.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={artifact.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-xs font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            <Play className="h-3.5 w-3.5" /> Run Test
                        </a>
                        <a
                            href={artifact.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Open App <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-4 rounded-xl flex items-start gap-4 group border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.02]">
            <div className={cn("shrink-0 p-3 rounded-xl bg-secondary",
                artifact.type === 'CODE' ? 'text-blue-400' :
                    artifact.type === 'IMAGE' ? 'text-purple-400' :
                        'text-orange-400'
            )}>
                <Icon className="h-6 w-6" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm truncate pr-2" title={artifact.name}>{artifact.name}</h4>
                    <a href={artifact.url} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                        <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </a>
                </div>

                <p className="text-xs text-muted-foreground mb-3">{artifact.type} • {taskTitle}</p>

                {artifact.type === 'CODE' ? (
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-muted-foreground">
                            <Github className="h-3 w-3" /> {artifact.metadata?.branch || 'main'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{artifact.metadata?.commitHash?.substring(0, 7)}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <a href={artifact.url} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                            View <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
