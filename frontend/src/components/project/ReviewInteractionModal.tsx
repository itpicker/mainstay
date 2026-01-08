'use client';

import { X, CheckCircle2, MessageSquare, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { ReviewRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DecisionCard } from './DecisionCard';
import { formatDate } from '@/lib/date';

interface ReviewInteractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: ReviewRequest;
    onAction: (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED', optionId?: string) => void;
}

export function ReviewInteractionModal({ isOpen, onClose, request, onAction }: ReviewInteractionModalProps) {
    if (!isOpen) return null;

    const handleAction = (action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED', optionId?: string) => {
        onAction(request.id, action, optionId);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden glass-card">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 shrink-0">
                            {request.type === 'DECISION' ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{request.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                                    {request.type || 'Review Required'}
                                </span>
                                <span className="text-xs text-muted-foreground">Requested on {formatDate(request.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <X className="h-6 w-6 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">{request.description}</p>
                    </div>

                    {/* Artifacts */}
                    {request.artifacts && request.artifacts.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Related Artifacts
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {request.artifacts.map((artifact) => (
                                    <a
                                        key={artifact.id}
                                        href={artifact.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-3 bg-secondary/30 border border-white/5 rounded-lg hover:bg-secondary/50 transition-colors text-foreground group"
                                    >
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div>
                                            <div className="font-medium group-hover:text-primary transition-colors">{artifact.name}</div>
                                            <div className="text-xs text-muted-foreground">{artifact.type}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Decision Options */}
                    {request.type === 'DECISION' && (
                        <div className="mt-8 border-t border-white/5 pt-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-400" />
                                Decision Required
                            </h3>
                            <div className="-mx-2">
                                <DecisionCard
                                    request={request}
                                    onSelectOption={(optionId) => handleAction('APPROVED', optionId)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions (Only for non-decision, or general reject) */}
                <div className="p-6 border-t border-white/5 bg-background/50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={() => handleAction('REJECTED')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all font-medium"
                    >
                        <XCircle className="h-5 w-5" /> Reject
                    </button>
                    <button
                        onClick={() => handleAction('CHANGES_REQUESTED')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-all font-medium"
                    >
                        <MessageSquare className="h-5 w-5" /> Request Changes
                    </button>
                    {request.type !== 'DECISION' && (
                        <button
                            onClick={() => handleAction('APPROVED')}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white shadow-lg shadow-green-500/20 rounded-lg hover:bg-green-600 transition-all font-bold"
                        >
                            <CheckCircle2 className="h-5 w-5" /> Approve
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
