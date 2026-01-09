'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import { ReviewRequest, Artifact } from '@/lib/types';

// Mock Data for Inbox
const initialReviewRequests: ReviewRequest[] = [
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
    },
    {
        id: 'rev-2',
        taskId: '102',
        projectId: '1',
        title: 'Home Page Hero Section Implementation',
        description: 'The hero section implementation is ready for review. I have used the new brand colors. Please check the component code.',
        status: 'PENDING',
        artifacts: [
            { id: 'a3', name: 'HeroSection.tsx', type: 'CODE', url: '#', createdAt: '2025-12-10' }
        ],
        createdAt: '2025-12-10T11:30:00Z'
    }
];

export default function InboxPage() {
    const [requests, setRequests] = useState<ReviewRequest[]>(initialReviewRequests);

    const handleAction = (id: string, action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT') => {
        // In a real app, this would call an API
        console.log(`Request ${id} action: ${action}`);

        // Optimistic update for demo
        setRequests(requests.filter(req => req.id !== id));
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                <p className="text-muted-foreground mt-1">Review and approve work from your AI agents.</p>
            </div>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-20 border border-dashed rounded-xl bg-muted/30">
                        <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">All caught up!</h3>
                        <p className="text-muted-foreground">You have no pending reviews.</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="glass-card p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Content Section */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                    Review Required
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-semibold">{req.title}</h3>
                                        </div>
                                    </div>

                                    <div className="bg-secondary/50 p-4 rounded-lg text-sm text-foreground/90 leading-relaxed">
                                        {req.description}
                                    </div>

                                    {/* Artifacts */}
                                    {req.artifacts.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Artifacts to Review</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {req.artifacts.map((artifact) => (
                                                    <a
                                                        key={artifact.id}
                                                        href={artifact.url}
                                                        className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg text-sm hover:bg-secondary transition-colors group"
                                                    >
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        <span>{artifact.name}</span>
                                                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Section */}
                                <div className="flex md:flex-col gap-2 md:w-48 shrink-0 md:border-l md:pl-6 border-white/10 justify-center md:justify-start">
                                    <button
                                        onClick={() => handleAction(req.id, 'APPROVE')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-lg transition-colors font-medium text-sm"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'REQUEST_CHANGES')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 rounded-lg transition-colors font-medium text-sm"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Changes
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'REJECT')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors font-medium text-sm"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
