export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'PLANNING';
export type TaskStatus = string;
export type AgentStatus = 'IDLE' | 'BUSY' | 'OFFLINE';
export type AgentRole = 'RESEARCHER' | 'DEVELOPER' | 'DESIGNER' | 'REVIEWER' | 'MANAGER';

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
    description: string;
    status: ProjectStatus;
    createdAt: string;
    deadline?: string;
    taskCount: number;
    completedTaskCount: number;
    stages: ProjectStage[];
}

export interface Artifact {
    id: string;
    name: string;
    type: 'CODE' | 'DOCUMENT' | 'IMAGE' | 'ARCHIVE';
    url: string;
    createdAt: string;
}

export interface Task {
    id: string;
    projectId: string;
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
}

export interface Agent {
    id: string;
    name: string;
    role: AgentRole;
    status: AgentStatus;
    capabilities: string[];
    avatar?: string;
}
