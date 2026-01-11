import { api } from './client';

export interface ChatMessage {
    role: 'user' | 'agent';
    content: string;
}

export const ChatService = {
    sendMessage: async (agentId: string, message: string, history: ChatMessage[]): Promise<string> => {
        const response = await api.post<{ response: string }>('/chat/message', {
            agent_id: agentId,
            message,
            history
        });
        return response.data.response;
    }
};
