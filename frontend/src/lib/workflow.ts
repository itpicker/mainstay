import { AgentRole, Project, Task } from './types';

// --- Workflow Types ---

export type WorkflowStageId =
    | 'REQUIREMENTS'
    | 'ARCHITECTURE'
    | 'DESIGN'
    | 'IMPLEMENTATION'
    | 'REVIEW'
    | 'COMPLETED';

export interface WorkflowGate {
    requiredArtifacts: string[]; // e.g., ['PRD'], ['Architecture Spec']
    approverRole: AgentRole | 'USER';
    label: string; // e.g., "Sign-off PRD"
}

export interface WorkflowStageDefinition {
    id: WorkflowStageId;
    name: string;
    description: string;
    allowedRoles: (AgentRole | 'USER')[];
    gate: WorkflowGate | null; // null for final stage
    nextStageId: WorkflowStageId | null;
}

// --- Workflow Configuration (The 5-Step Protocol) ---

export const WORKFLOW_STAGES: Record<WorkflowStageId, WorkflowStageDefinition> = {
    'REQUIREMENTS': {
        id: 'REQUIREMENTS',
        name: 'Requirements Analysis',
        description: 'Define what to build. Gather requirements and draft the PRD.',
        allowedRoles: ['MANAGER', 'RESEARCHER', 'USER'],
        gate: {
            requiredArtifacts: ['PRD'],
            approverRole: 'USER',
            label: 'Approve PRD'
        },
        nextStageId: 'ARCHITECTURE'
    },
    'ARCHITECTURE': {
        id: 'ARCHITECTURE',
        name: 'System Architecture',
        description: 'Define technical specs, tech stack, and database schema.',
        allowedRoles: ['MANAGER', 'developer', 'USER'], // 'developer' usually acts as architect here if no specific Architect role
        gate: {
            requiredArtifacts: ['Architecture Spec'],
            approverRole: 'USER',
            label: 'Approve Architecture'
        },
        nextStageId: 'DESIGN'
    },
    'DESIGN': {
        id: 'DESIGN',
        name: 'Visual Design',
        description: 'Create wireframes, mockups, and the design system.',
        allowedRoles: ['DESIGNER', 'USER'],
        gate: {
            requiredArtifacts: ['Design Assets'],
            approverRole: 'USER',
            label: 'Approve Designs'
        },
        nextStageId: 'IMPLEMENTATION'
    },
    'IMPLEMENTATION': {
        id: 'IMPLEMENTATION',
        name: 'Implementation',
        description: 'Write the code based on approved specs.',
        allowedRoles: ['DEVELOPER', 'MANAGER', 'USER'],
        gate: {
            requiredArtifacts: ['Source Code'],
            approverRole: 'MANAGER', // Manager allows it to go to Review
            label: 'Submit for Review'
        },
        nextStageId: 'REVIEW'
    },
    'REVIEW': {
        id: 'REVIEW',
        name: 'QA & Deploy',
        description: 'Verify functionality, run tests, and deploy.',
        allowedRoles: ['MANAGER', 'USER'],
        gate: {
            requiredArtifacts: ['Deployment'],
            approverRole: 'USER',
            label: 'Final Approval'
        },
        nextStageId: 'COMPLETED'
    },
    'COMPLETED': {
        id: 'COMPLETED',
        name: 'Project Completed',
        description: 'All work finished and signed off.',
        allowedRoles: ['USER'],
        gate: null,
        nextStageId: null
    }
};

// --- Workflow Engine ---

export class WorkflowEngine {
    static getStage(stageId: WorkflowStageId): WorkflowStageDefinition {
        return WORKFLOW_STAGES[stageId];
    }

    static canTransition(project: Project, currentArtifacts: string[]): { allowed: boolean; reason?: string } {
        // Safe check for missing workflowStage
        const currentStageId = (project as any).workflowStage as WorkflowStageId || 'REQUIREMENTS';
        const stageDef = this.getStage(currentStageId);

        if (!stageDef.gate) return { allowed: false, reason: 'Already at final stage.' };

        // Check Artifacts
        const missingArtifacts = stageDef.gate.requiredArtifacts.filter(req => !currentArtifacts.includes(req));
        if (missingArtifacts.length > 0) {
            return {
                allowed: false,
                reason: `Missing required artifacts: ${missingArtifacts.join(', ')}`
            };
        }

        return { allowed: true };
    }

    static getNextStage(currentStageId: WorkflowStageId): WorkflowStageId | null {
        return WORKFLOW_STAGES[currentStageId].nextStageId;
    }

    static getProgress(currentStageId: WorkflowStageId): number {
        const stages = Object.keys(WORKFLOW_STAGES) as WorkflowStageId[];
        const currentIndex = stages.indexOf(currentStageId);
        return ((currentIndex + 1) / stages.length) * 100;
    }
}
