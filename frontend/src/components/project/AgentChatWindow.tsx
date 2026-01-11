'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Send, Bot, User, Maximize2 } from 'lucide-react';
import { Agent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChatService } from '@/lib/api/chat';

interface AgentChatWindowProps {
    agent: Agent;
    onClose: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: number;
}

export function AgentChatWindow({ agent, onClose }: AgentChatWindowProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'agent',
            content: `Hello! I am ${agent.name}. How can I assist you with the project today?`,
            timestamp: Date.now()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
        }
    }, [messages, isMinimized]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: Date.now()
        };

        const currentHistory = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        const agentMsgId = (Date.now() + 1).toString();
        // Placeholder for Agent message
        const agentMsg: Message = {
            id: agentMsgId,
            role: 'agent',
            content: '',
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, agentMsg]);

        try {
            await ChatService.streamMessage(agent.id, userMsg.content, currentHistory, (chunk) => {
                setMessages(prev => prev.map(msg => {
                    if (msg.id === agentMsgId) {
                        return { ...msg, content: msg.content + chunk };
                    }
                    return msg;
                }));
                setIsTyping(false); // Stop typing indicator as soon as first chunk arrives
            });
        } catch (error) {
            console.error("Chat Error:", error);
            // If failed empty, show error. If partially filled, maybe just stop? 
            // Better to show error message separately if completely failed.
            setMessages(prev => prev.map(msg => {
                if (msg.id === agentMsgId && msg.content === '') {
                    return { ...msg, content: "I'm having trouble thinking right now. Please try again." };
                }
                return msg;
            }));
        } finally {
            setIsTyping(false);
        }
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="flex items-center gap-2 bg-secondary border border-white/10 rounded-t-lg px-4 py-2 hover:bg-secondary/80 transition-colors shadow-lg"
                >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium text-sm">{agent.name}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="ml-2 hover:text-red-500"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-background border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-sm">{agent.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase bg-white/5 px-1.5 py-0.5 rounded">
                        {agent.role}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground"
                    >
                        <Minimize2 className="h-3 w-3" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-red-500"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                {messages.map((msg) => {
                    if (!msg.content && msg.role === 'agent') return null;
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-2 max-w-[85%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            )}>
                                {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                            </div>
                            <div className={cn(
                                "p-2 rounded-lg text-xs leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-primary/20 text-primary-foreground rounded-tr-none"
                                    : "bg-white/10 text-foreground rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-[10px]">
                            <Bot className="h-3 w-3" />
                        </div>
                        <div className="bg-white/10 px-3 py-2 rounded-lg rounded-tl-none flex gap-1 items-center h-8">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-secondary/30 border-t border-white/5">
                <div className="flex gap-2">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
