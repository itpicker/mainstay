export interface ChatMessage {
    role: 'user' | 'assistant' | 'agent';
    content: string;
}

export const streamChat = async (
    message: string,
    agentId: string,
    history: ChatMessage[],
    threadId?: string | null,
    onChunk?: (chunk: string) => void,
    onDone?: () => void,
    onError?: (error: any) => void
) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ...` // TODO: Add auth token if needed
            },
            body: JSON.stringify({
                agent_id: agentId,
                message,
                history,
                thread_id: threadId
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader available');

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                if (onDone) onDone();
                break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '');
                    if (dataStr === '[DONE]') {
                        // Handle done logic if distinct from stream end
                    } else {
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.content && onChunk) {
                                onChunk(data.content);
                            }
                            if (data.error && onError) {
                                onError(data.error);
                            }
                        } catch (e) {
                            console.error("Error parsing chunk", e);
                        }
                    }
                }
            }
        }
    } catch (error) {
        if (onError) onError(error);
    }
};
