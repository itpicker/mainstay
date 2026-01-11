export type ProjectLifecycle = 'PLANNING' | 'EXECUTION' | 'COMPLETED';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'PLANNING';
export type TaskStatus = string;
export type AgentStatus = 'IDLE' | 'BUSY' | 'OFFLINE';
export type AgentRole = 'RESEARCHER' | 'DEVELOPER' | 'DESIGNER' | 'REVIEWER' | 'MANAGER';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';

export interface ChangeRequest {
    id: string;
    projectId: string;
    title: string;
    description: string;
    impactAnalysis: string; // AI generated or user input
    status: ReviewStatus;
    requestedBy: string; // 'USER' or 'AGENT'
    createdAt: string;
}

export interface DecisionOption {
    id: string;
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    estimatedEffort: string;
    cost: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ReviewRequest {
    id: string;
    taskId: string;
    projectId: string;
    title: string;
    description: string;
    status: ReviewStatus;
    type?: 'APPROVAL' | 'DECISION'; // New field
    options?: DecisionOption[];     // For DECISION type
    selectedOptionId?: string;      // User choice
    artifacts: Artifact[];
    feedback?: string;
    createdAt: string;
}

export interface Workspace {
    id: string;
    name: string;
    type: 'PERSONAL' | 'TEAM' | 'ENTERPRISE';
}

export interface ProjectStage {
    id: string;
    name: string;
    color: string;
}

export interface Project {
    id: string;
    workspaceId: string;
    name: string;
    description: string; // Restored
    status: ProjectStatus;
    lifecycle: ProjectLifecycle; // Restored field for Phase Management
    // workflowStage?: string; // Dynamic Stage ID
    // workflowTemplateId?: string; // Valid Template ID
    // isPlanningFrozen: boolean;   // Deprecated / repurposed
    // planningFrozenAt?: string;   // New field

    // New Dynamic Locking Field
    isAgentsActive: boolean; // Determines if editing is locked

    workflowStage?: string;
    workflowTemplateId?: string;
    isPlanningFrozen: boolean;
    planningFrozenAt?: string;
    createdAt: string;
    deadline?: string;
    taskCount: number;
    completedTaskCount: number;
    stages: ProjectStage[];
}

export interface Artifact {
    id: string;
    name: string;
    type: 'CODE' | 'DOCUMENT' | 'IMAGE' | 'ARCHIVE' | 'DEPLOYMENT';
    url: string;
    status: 'PENDING' | 'READY' | 'DEPLOYED' | 'FAILED' | 'OFFLINE' | 'ONLINE'; // Extended statuses
    metadata?: {
        version?: string;
        branch?: string;
        commitHash?: string;
        environment?: 'STAGING' | 'PRODUCTION';
        testStatus?: 'PASS' | 'FAIL' | 'UNTESTED';
        [key: string]: any;
    };
    createdAt: string;
}

export interface Task {
    id: string;
    projectId: string;
    activeReviewRequestId?: string;
    title: string;
    description: string;
    status: TaskStatus;
    assignedAgentId?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    deadline?: string;
    startDate?: string;
    endDate?: string;
    artifacts?: Artifact[];
    subtasks?: {
        id: string;
        title: string;
        completed: boolean;
    }[];
    dependencies?: string[]; // Task IDs that must complete before this task can start
    createdAt?: string;
}

export interface AgentMessage {
    id: string;
    fromAgentId: string;
    toAgentId: string; // or 'BROADCAST'
    projectId: string;
    taskId?: string; // Context
    type: 'HANDOFF' | 'REQUEST_INFO' | 'BLOCKER' | 'APPROVAL';
    content: string;
    timestamp: string;
    read: boolean;
}

export interface Agent {
    id: string;
    name: string;
    role: string; // Relaxed from AgentRole to string for custom roles
    model?: string; // New field
    goal?: string; // New field: Instructions/Persona
    status: AgentStatus;
    capabilities: string[];
    autonomyLevel?: number; // 1-5
    avatar?: string;
}
