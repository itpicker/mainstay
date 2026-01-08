export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'PLANNING';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type AgentStatus = 'IDLE' | 'BUSY' | 'OFFLINE';
export type AgentRole = 'RESEARCHER' | 'DEVELOPER' | 'DESIGNER' | 'REVIEWER' | 'MANAGER';

export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    createdAt: string;
    deadline?: string;
    taskCount: number;
    completedTaskCount: number;
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
}

export interface Agent {
    id: string;
    name: string;
    role: AgentRole;
    status: AgentStatus;
    capabilities: string[];
    avatar?: string;
}
