import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    // Basic parsing to detect Agent Name prefix (e.g. "**Researcher**: ...")
    let displayContent = content;
    let agentName = "Agent";

    if (!isUser) {
        const match = content.match(/^\*\*([a-zA-Z0-9_]+)\*\*:/);
        if (match) {
            agentName = match[1];
            // We can optionally remove the prefix from display content if we use a badge
            // displayContent = content.replace(match[0], '').trim(); 
        }
    }

    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>

                {/* Avatar */}
                <div className={`p-2 rounded-full shrink-0 ${isUser ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {!isUser && <span className="text-xs text-muted-foreground mb-1 ml-1">{agentName}</span>}

                    <div className={`px-4 py-3 rounded-2xl text-sm ${isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-card border border-border rounded-tl-sm shadow-sm'
                        }`}>
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                            <ReactMarkdown>{displayContent}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
