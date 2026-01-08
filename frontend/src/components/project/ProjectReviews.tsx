import { useState } from 'react';
import { ReviewRequest, Agent } from '@/lib/types';
import { CheckCircle2, MessageSquare, XCircle, FileText, ExternalLink, Clock, User } from 'lucide-react';

interface ProjectReviewsProps {
    projectId: string;
    agents: Agent[];
}

// Mock History Data
const mockHistory: ReviewRequest[] = [
    {
        id: 'rev-history-1',
        taskId: '100',
        projectId: '1',
        title: 'Initial Project Plan',
        description: 'Proposed project structure and timeline.',
        status: 'APPROVED',
        artifacts: [],
        feedback: 'Looks good, let\'s proceed.',
        createdAt: '2025-11-30T09:00:00Z'
    }
];

// Mock Pending Data (In a real app, this would come from props or API)
const mockPending: ReviewRequest[] = [
    {
        id: 'rev-1',
        taskId: '101',
        projectId: '1',
        title: 'Brand Guidelines PDF Review',
        description: 'I have finalized the color palette and typography selections based on the competitor research. Please review the attached PDF.',
        status: 'PENDING',
        artifacts: [
            { id: 'a1', name: 'mainstay_brand_guidelines_v1.pdf', type: 'DOCUMENT', url: '#', createdAt: '2025-12-05' }
        ],
        createdAt: '2025-12-05T14:00:00Z'
    }
];

export function ProjectReviews({ projectId, agents }: ProjectReviewsProps) {
    const [pendingRequests, setPendingRequests] = useState<ReviewRequest[]>(mockPending);
    const [history, setHistory] = useState<ReviewRequest[]>(mockHistory);

    const handleAction = (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED') => {
        const request = pendingRequests.find(r => r.id === id);
        if (!request) return;

        // Move to history
        const updatedRequest = { ...request, status: action, feedback: 'Auto-generated feedback for demo' };
        setHistory([updatedRequest, ...history]);
        setPendingRequests(pendingRequests.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Pending Reviews Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    Pending Decisions
                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full border border-orange-500/20">
                        {pendingRequests.length}
                    </span>
                </h2>

                {pendingRequests.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl bg-muted/30">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No pending review requests.</p>
                    </div>
                ) : (
                    pendingRequests.map((req) => (
                        <div key={req.id} className="glass-card p-6 rounded-xl border border-border/50 hover:border-orange-500/30 transition-all">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                            Action Required
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(req.createdAt).toLocaleDateString()}
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
                    ))
                )}
            </div>

            {/* History Section */}
            <div className="pt-8 border-t border-border/40 space-y-4">
                <h2 className="text-lg font-semibold text-muted-foreground">Decision History</h2>

                <div className="space-y-3">
                    {history.map((req) => (
                        <div key={req.id} className="group flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/30">
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${req.status === 'APPROVED' ? 'bg-green-500' :
                                    req.status === 'REJECTED' ? 'bg-red-500' : 'bg-orange-500'
                                }`} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="font-medium truncate">{req.title}</h3>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold ${req.status === 'APPROVED' ? 'bg-green-500/5 text-green-500 border-green-500/20' :
                                            req.status === 'REJECTED' ? 'bg-red-500/5 text-red-500 border-red-500/20' :
                                                'bg-orange-500/5 text-orange-500 border-orange-500/20'
                                        }`}>
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
            </div>
        </div>
    );
}
