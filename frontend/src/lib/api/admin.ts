import { api } from './client';

export interface AIModel {
    id: string;
    name: string;
    model_id: string;
    provider: 'OPENAI' | 'ANTHROPIC' | 'OLLAMA' | 'OTHER';
    api_key?: string;
    base_url?: string;
    is_active: boolean;
    created_at: string;
}

// ... (Existing AIModel interface)

export interface UserProfile {
    id: string;
    email: string; // May depend on how we join or if we just get it from Auth
    full_name?: string;
    avatar_url?: string;
    role: string;
    created_at: string;
}

export interface SystemStats {
    total_users: number;
    total_projects: number;
    total_agents: number;
    total_tasks: number;
}

export const AdminService = {
    // --- Models ---
    getAllModels: async (): Promise<AIModel[]> => {
        const response = await api.get<AIModel[]>('/admin/models');
        return response.data;
    },

    createModel: async (data: { name: string; model_id: string; provider: string; api_key?: string; base_url?: string }): Promise<AIModel> => {
        const response = await api.post<AIModel>('/admin/models', data);
        return response.data;
    },

    deleteModel: async (id: string): Promise<void> => {
        await api.delete(`/admin/models/${id}`);
    },

    // --- Users ---
    getAllUsers: async (): Promise<UserProfile[]> => {
        const response = await api.get<UserProfile[]>('/admin/users');
        return response.data;
    },

    updateUser: async (id: string, data: { role: string }): Promise<void> => {
        await api.patch(`/admin/users/${id}`, data);
    },

    // --- Stats ---
    getStats: async (): Promise<SystemStats> => {
        const response = await api.get<SystemStats>('/admin/stats');
        return response.data;
    }
};
