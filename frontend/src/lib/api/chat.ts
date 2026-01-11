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
    },

    streamMessage: async (agentId: string, message: string, history: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> => {
        // Use native fetch for streaming
        const token = (await import('@/lib/supabase')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await token}`
            },
            body: JSON.stringify({
                agent_id: agentId,
                message,
                history
            })
        });

        if (!response.ok) {
            throw new Error(`Stream failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    if (dataStr === '[DONE]') return;
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.content) {
                            onChunk(data.content);
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk", e);
                    }
                }
            }
        }
    }
};
