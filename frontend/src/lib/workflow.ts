import { AgentRole, Project, Task } from './types';

// --- Workflow Types ---

export type WorkflowStageId = string; // Generic string to support dynamic stages

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

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    stages: Record<WorkflowStageId, WorkflowStageDefinition>;
    initialStageId: WorkflowStageId;
    stageOrder: WorkflowStageId[]; // Explicit order for valid visualization
}

// --- Templates Configuration ---

const SOFTWARE_DEV_TEMPLATE: WorkflowTemplate = {
    id: 'SOFTWARE_DEV',
    name: 'Software Development Standard',
    description: 'Strict 5-step protocol for software projects.',
    initialStageId: 'REQUIREMENTS',
    stageOrder: ['REQUIREMENTS', 'ARCHITECTURE', 'DESIGN', 'IMPLEMENTATION', 'REVIEW', 'COMPLETED'],
    stages: {
        'REQUIREMENTS': {
            id: 'REQUIREMENTS',
            name: 'Requirements Analysis',
            description: 'Define what to build. Gather requirements and draft the PRD.',
            allowedRoles: ['MANAGER', 'RESEARCHER', 'USER'],
            gate: { requiredArtifacts: ['PRD'], approverRole: 'USER', label: 'Approve PRD' },
            nextStageId: 'ARCHITECTURE'
        },
        'ARCHITECTURE': {
            id: 'ARCHITECTURE',
            name: 'System Architecture',
            description: 'Define technical specs, tech stack, and database schema.',
            allowedRoles: ['MANAGER', 'DEVELOPER', 'USER'],
            gate: { requiredArtifacts: ['Architecture Spec'], approverRole: 'USER', label: 'Approve Architecture' },
            nextStageId: 'DESIGN'
        },
        'DESIGN': {
            id: 'DESIGN',
            name: 'Visual Design',
            description: 'Create wireframes, mockups, and the design system.',
            allowedRoles: ['DESIGNER', 'USER'],
            gate: { requiredArtifacts: ['Design Assets'], approverRole: 'USER', label: 'Approve Designs' },
            nextStageId: 'IMPLEMENTATION'
        },
        'IMPLEMENTATION': {
            id: 'IMPLEMENTATION',
            name: 'Implementation',
            description: 'Write the code based on approved specs.',
            allowedRoles: ['DEVELOPER', 'MANAGER', 'USER'],
            gate: { requiredArtifacts: ['Source Code'], approverRole: 'MANAGER', label: 'Submit for Review' },
            nextStageId: 'REVIEW'
        },
        'REVIEW': {
            id: 'REVIEW',
            name: 'QA & Deploy',
            description: 'Verify functionality, run tests, and deploy.',
            allowedRoles: ['MANAGER', 'USER'],
            gate: { requiredArtifacts: ['Deployment'], approverRole: 'USER', label: 'Final Approval' },
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
    }
};

const GENERAL_PROJECT_TEMPLATE: WorkflowTemplate = {
    id: 'GENERAL_PROJECT',
    name: 'General Project',
    description: 'Simplified 3-step workflow for general tasks.',
    initialStageId: 'PLANNING',
    stageOrder: ['PLANNING', 'EXECUTION', 'REVIEW', 'COMPLETED'],
    stages: {
        'PLANNING': {
            id: 'PLANNING',
            name: 'Planning',
            description: 'Define goals and tasks.',
            allowedRoles: ['MANAGER', 'USER'],
            gate: { requiredArtifacts: ['Plan'], approverRole: 'USER', label: 'Approve Plan' },
            nextStageId: 'EXECUTION'
        },
        'EXECUTION': {
            id: 'EXECUTION',
            name: 'Execution',
            description: 'Perform the work.',
            allowedRoles: ['MANAGER', 'USER'],
            gate: { requiredArtifacts: ['Deliverables'], approverRole: 'MANAGER', label: 'Submit Work' },
            nextStageId: 'REVIEW'
        },
        'REVIEW': {
            id: 'REVIEW',
            name: 'Review & Close',
            description: 'Review final outputs and close project.',
            allowedRoles: ['USER'],
            gate: { requiredArtifacts: [], approverRole: 'USER', label: 'Close Project' },
            nextStageId: 'COMPLETED'
        },
        'COMPLETED': {
            id: 'COMPLETED',
            name: 'Completed',
            description: 'Project finished.',
            allowedRoles: ['USER'],
            gate: null,
            nextStageId: null
        }
    }
};

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
    'SOFTWARE_DEV': SOFTWARE_DEV_TEMPLATE,
    'GENERAL_PROJECT': GENERAL_PROJECT_TEMPLATE
};

// --- Workflow Engine ---

export class WorkflowEngine {
    static getTemplate(templateId?: string): WorkflowTemplate {
        return WORKFLOW_TEMPLATES[templateId || 'SOFTWARE_DEV'] || SOFTWARE_DEV_TEMPLATE;
    }

    static getStage(templateId: string | undefined, stageId: WorkflowStageId): WorkflowStageDefinition | undefined {
        const template = this.getTemplate(templateId);
        return template.stages[stageId];
    }

    static getOrderedStages(templateId?: string): WorkflowStageDefinition[] {
        const template = this.getTemplate(templateId);
        return template.stageOrder.map(id => template.stages[id]);
    }

    static canTransition(project: Project, currentArtifacts: string[]): { allowed: boolean; reason?: string } {
        const template = this.getTemplate(project.workflowTemplateId);
        const currentStageId = project.workflowStage || template.initialStageId;
        const stageDef = template.stages[currentStageId];

        if (!stageDef) return { allowed: false, reason: 'Invalid stage.' };
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

    static getNextStage(project: Project): WorkflowStageId | null {
        const template = this.getTemplate(project.workflowTemplateId);
        const currentStageId = project.workflowStage || template.initialStageId;
        return template.stages[currentStageId]?.nextStageId || null;
    }
}
