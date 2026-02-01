'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { streamChat } from '@/lib/api/chat';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatWindow() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load thread_id from local storage on mount
    useEffect(() => {
        const savedThread = localStorage.getItem('mainstay_thread_id');
        if (savedThread) setThreadId(savedThread);
        else {
            const newThread = crypto.randomUUID();
            setThreadId(newThread);
            localStorage.setItem('mainstay_thread_id', newThread);
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        // Placeholder for streaming accumulation
        let fullResponse = "";

        // Add an empty assistant message to stream into
        setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

        await streamChat(
            userMsg,
            "supervisor", // Default agent ID, should catch all
            [], // We rely on backend persistence so we don't send full history every time unless stateless
            threadId,
            (chunk) => {
                fullResponse += chunk;
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = fullResponse;
                    return newArr;
                });
            },
            () => setIsLoading(false),
            (err) => {
                console.error(err);
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err}` }]);
                setIsLoading(false);
            }
        );
    };

    const clearChat = () => {
        setMessages([]);
        const newThread = crypto.randomUUID();
        setThreadId(newThread);
        localStorage.setItem('mainstay_thread_id', newThread);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all z-50 hover:scale-105"
            >
                <MessageSquare className="h-6 w-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-background border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="h-14 border-b border-border bg-muted/30 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Mainstay Agent Team</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-green-600 font-medium">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={clearChat} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-destructive transition-colors" title="New Chat">
                        <Trash2 size={16} />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-2 opacity-60">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">How can we help you today?</p>
                        <p className="text-xs">Ask us to research, code, or review.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isLoading && messages.length > 0 && messages[messages.length - 1].content === "" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                        <span className="animate-spin">⏳</span> Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Assign a task..."
                        className="w-full min-h-[50px] max-h-[120px] bg-secondary/50 border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary pr-12 resize-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 bottom-2.5 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
