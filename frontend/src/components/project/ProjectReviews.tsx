'use client';

import { useState } from 'react';
import { ReviewRequest, Agent, ChangeRequest } from '@/lib/types';
import { CheckCircle2, MessageSquare, XCircle, FileText, ExternalLink, Clock, AlertTriangle, History } from 'lucide-react';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { DecisionCard } from '@/components/project/DecisionCard';

interface ProjectReviewsProps {
    projectId: string;
    agents: Agent[];
    pendingRequests: ReviewRequest[];
    history: ReviewRequest[];
    changeRequests: ChangeRequest[];
    onAction: (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED', optionId?: string) => void;
}

type ActiveTab = 'reviews' | 'CHANGES' | 'HISTORY';

export function ProjectReviews({ projectId, agents, pendingRequests, history, changeRequests, onAction }: ProjectReviewsProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('reviews');

    // Helper to request option selection
    const handleSelectOption = (requestId: string, optionId: string) => {
        onAction(requestId, 'APPROVED', optionId);
    };

    const handleAction = (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED') => {
        onAction(id, action);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                        activeTab === 'reviews' ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}
                >
                    <MessageSquare className="h-4 w-4" />
                    Reviews
                    {pendingRequests.length > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pendingRequests.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('CHANGES')}
                    className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                        activeTab === 'CHANGES' ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}
                >
                    <AlertTriangle className="h-4 w-4" />
                    Change Requests
                    {changeRequests.length > 0 && (
                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{changeRequests.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                        activeTab === 'HISTORY' ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}
                >
                    <History className="h-4 w-4" />
                    History
                </button>
            </div>

            {/* Content: Reviews */}
            {activeTab === 'reviews' && (
                <div className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-12 border border-dashed rounded-xl bg-muted/30">
                            <CheckCircle2 className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No pending review requests.</p>
                        </div>
                    ) : (
                        pendingRequests.map((req) => (
                            req.type === 'DECISION' ? (
                                <div key={req.id} className="glass-card p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 transition-all">
                                    <DecisionCard
                                        request={req}
                                        onSelectOption={(optionId) => handleSelectOption(req.id, optionId)}
                                    />
                                </div>
                            ) : (
                                <div key={req.id} className="glass-card p-6 rounded-xl border border-border/50 hover:border-orange-500/30 transition-all">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                                    Review Required
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(req.createdAt)}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold">{req.title}</h3>
                                                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{req.description}</p>
                                            </div>

                                            {req.artifacts.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {req.artifacts.map((artifact) => (
                                                        <a key={artifact.id} href={artifact.url} className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg text-sm hover:bg-secondary transition-colors text-foreground/80">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                            {artifact.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex md:flex-col gap-2 md:w-40 shrink-0 md:border-l md:pl-6 border-white/10 justify-center md:justify-start">
                                            <button onClick={() => handleAction(req.id, 'APPROVED')} className="btn-approve flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium">
                                                <CheckCircle2 className="h-4 w-4" /> Approve
                                            </button>
                                            <button onClick={() => handleAction(req.id, 'CHANGES_REQUESTED')} className="btn-change flex items-center justify-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors text-sm font-medium">
                                                <MessageSquare className="h-4 w-4" /> Changes
                                            </button>
                                            <button onClick={() => handleAction(req.id, 'REJECTED')} className="btn-reject flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
                                                <XCircle className="h-4 w-4" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))
                    )}
                </div>
            )}

            {/* Content: Change Requests */}
            {activeTab === 'CHANGES' && (
                <div className="space-y-4">
                    {changeRequests.length === 0 ? (
                        <div className="text-center py-12 border border-dashed rounded-xl bg-muted/30">
                            <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No active change requests.</p>
                        </div>
                    ) : (
                        changeRequests.map((cr) => (
                            <div key={cr.id} className="glass-card p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all bg-blue-500/5">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                Change Request
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(cr.createdAt)}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded border border-white/10">
                                            {cr.requestedBy === 'USER' ? 'Requested by You' : 'External Request'}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">{cr.title}</h3>
                                        <p className="text-muted-foreground mt-1 text-sm">{cr.description}</p>
                                    </div>

                                    {cr.impactAnalysis && (
                                        <div className="bg-secondary/40 p-3 rounded-lg text-sm border border-white/5">
                                            <span className="font-semibold text-orange-400 block mb-1">Impact Analysis:</span>
                                            <span className="text-muted-foreground">{cr.impactAnalysis}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2 border-t border-white/5 mt-2">
                                        {/* Mock Actions for Change Requests usually handled by Agent, but here for demo */}
                                        <div className="text-xs text-muted-foreground flex items-center gap-2 italic">
                                            Analysis in progress by System...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Content: History */}
            {activeTab === 'HISTORY' && (
                <div className="space-y-3">
                    {history.map((req) => (
                        <div key={req.id} className="group flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/30">
                            <div className={cn("mt-1 h-2 w-2 rounded-full shrink-0",
                                req.status === 'APPROVED' ? 'bg-green-500' :
                                    req.status === 'REJECTED' ? 'bg-red-500' : 'bg-orange-500'
                            )} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="font-medium truncate">{req.title}</h3>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDate(req.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold",
                                        req.status === 'APPROVED' ? 'bg-green-500/5 text-green-500 border-green-500/20' :
                                            req.status === 'REJECTED' ? 'bg-red-500/5 text-red-500 border-red-500/20' :
                                                'bg-orange-500/5 text-orange-500 border-orange-500/20'
                                    )}>
                                        {req.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-clamp-1">
                                        {req.feedback || req.description}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
