import { api } from './client';
import { Project, Task, Agent } from '@/lib/types';

export const ProjectService = {
    // Projects
    getAllProjects: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>('/projects');
        return response.data;
    },

    getProject: async (id: string): Promise<Project> => {
        const response = await api.get<Project>(`/projects/${id}`);
        return response.data;
    },

    createProject: async (data: { title: string; description: string }): Promise<Project> => {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    },

    // Tasks
    getTasks: async (projectId: string): Promise<Task[]> => {
        const response = await api.get<Task[]>(`/projects/${projectId}/tasks`);
        return response.data;
    },

    createTask: async (projectId: string, data: Partial<Task>): Promise<Task> => {
        const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
        return response.data;
    },

    updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
        const response = await api.patch<Task>(`/tasks/${taskId}`, data);
        return response.data;
    },

    deleteTask: async (taskId: string): Promise<void> => {
        await api.delete(`/tasks/${taskId}`);
    },

    // Agents
    getTeam: async (projectId: string): Promise<Agent[]> => {
        const response = await api.get<Agent[]>(`/projects/${projectId}/team`);
        return response.data;
    }
};
