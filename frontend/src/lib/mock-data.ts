
import { ReviewRequest, ChangeRequest } from '@/lib/types';

export const mockHistory: ReviewRequest[] = [
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

export const mockPending: ReviewRequest[] = [
    {
        id: 'rev-2',
        taskId: '102',
        projectId: '1',
        title: 'Database Architecture Decision',
        description: 'We need to decide on the core database technology. This choice has major implications for scalability and development speed.',
        status: 'PENDING',
        type: 'DECISION',
        createdAt: '2025-12-06T09:00:00Z',
        artifacts: [],
        options: [
            {
                id: 'opt-1',
                title: 'PostgreSQL (Supabase)',
                description: 'Robust relational database with built-in auth and real-time features.',
                pros: ['Reference integrity', 'Complex queries', 'Mature ecosystem'],
                cons: ['Schema migrations needed', 'Higher setup complexity'],
                estimatedEffort: '3 Days',
                cost: 'MEDIUM'
            },
            {
                id: 'opt-2',
                title: 'Firebase (NoSQL)',
                description: 'Flexible document store optimized for rapid prototyping and live updates.',
                pros: ['Faster initial dev', 'Schemaless flexibility', 'Built-in sync'],
                cons: ['Limited query capability', 'Vendor lock-in'],
                estimatedEffort: '1 Day',
                cost: 'LOW'
            }
        ]
    },
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

export const mockChanges: ChangeRequest[] = [
    {
        id: 'cr-1',
        projectId: '1',
        title: 'Add Social Login',
        description: 'User wants to add Google and Apple login support.',
        impactAnalysis: 'Low impact on timeline, but requires new API keys.',
        status: 'PENDING',
        requestedBy: 'USER',
        createdAt: '2025-12-10T10:00:00Z'
    }
];
