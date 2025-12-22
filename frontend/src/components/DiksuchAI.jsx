import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Code2, Lightbulb, User, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AI_MODES = {
    GENERAL: { value: 'general', label: 'General', icon: Sparkles, color: 'blue', desc: 'General guidance & help' },
    CODING: { value: 'coding', label: 'Coding', icon: Code2, color: 'green', desc: 'Programming & debugging' },
    CREATIVE: { value: 'creative', label: 'Creative', icon: Lightbulb, color: 'purple', desc: 'Ideas & brainstorming' }
};

const DiksuchAI = ({ projectContext = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [mode, setMode] = useState('general');
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [credits, setCredits] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    // Load last 10 messages from localStorage when opening
    useEffect(() => {
        if (isOpen && conversation.length === 0) {
            const savedMessages = localStorage.getItem('diksuchAI_lastMessages');
            if (savedMessages) {
                try {
                    const parsed = JSON.parse(savedMessages);
                    setConversation(parsed);
                } catch (e) {
                    console.error('Failed to load saved messages:', e);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Save last 10 messages when conversation changes
    useEffect(() => {
        if (conversation.length > 0) {
            const last10 = conversation.slice(-10);
            localStorage.setItem('diksuchAI_lastMessages', JSON.stringify(last10));
        }
    }, [conversation]);

    // Fetch credit info when opening
    useEffect(() => {
        if (isOpen) {
            fetchCredits();
        }
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !isMinimized && chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen && !isMinimized) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, isMinimized]);

    const fetchCredits = async () => {
        try {
            const response = await api.get('/chatbot/credits');
            setCredits(response.data.credits);
            setIsPremium(response.data.isPremium);
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = message.trim();
        setMessage('');

        // Add user message to conversation
        setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await api.post('/chatbot/chat', {
                message: userMessage,
                mode,
                conversationHistory: [],
                projectContext: projectContext // Include project context
            });

            // Update credits if not quick response
            if (!response.data.isQuickResponse) {
                setCredits(response.data.credits);
                setIsPremium(response.data.isPremium);
            } else {
                await fetchCredits();
            }

            // Add AI response
            setConversation(prev => [
                ...prev,
                { role: 'assistant', content: response.data.response }
            ]);

        } catch (error) {
            console.error('Chat error:', error);

            // Check if content was blocked
            if (error.response?.data?.blocked) {
                toast.error(error.response.data.message, {
                    duration: 6000,
                    icon: '🚫',
                    style: {
                        background: '#fee',
                        color: '#c33',
                        fontWeight: 'bold'
                    }
                });

                // Add blocked message to conversation
                setConversation(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: error.response.data.message,
                        isBlocked: true
                    }
                ]);
            } else if (error.response?.status === 429) {
                // Rate limit error
                const retryAfter = error.response.data?.retryAfter || 5;
                toast.error(`🤖 AI is busy. Please wait ${retryAfter} seconds!`, {
                    duration: 5000,
                    icon: '⏳'
                });

                setConversation(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `⏳ AI is handling other requests. Please wait ${retryAfter} seconds and try again!`,
                        isError: true
                    }
                ]);
            } else if (error.response?.status === 503) {
                toast.error('🤖 AI temporarily busy. Please retry!', {
                    duration: 4000,
                    icon: '🔄'
                });

                setConversation(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: '🔄 AI service is temporarily busy. Please try again.',
                        isError: true
                    }
                ]);
            } else if (error.response?.status === 403) {
                toast.error('Daily credit limit reached! Upgrade to premium for unlimited access.', {
                    duration: 5000,
                    icon: '⚡'
                });
            } else {
                toast.error(error.response?.data?.message || 'Failed to get response');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setConversation([]);
        localStorage.removeItem('diksuchAI_lastMessages');
        toast.success('Conversation cleared');
    };

    const ModeIcon = AI_MODES[mode.toUpperCase()].icon;

    // Floating button - closed state
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[9999] p-4 rounded-full shadow-2xl transition-all hover:scale-110 hover:opacity-90"
                style={{ backgroundColor: '#2d6a4f' }}
                aria-label="Open Diksuchi-AI Chat"
            >
                <Bot className="h-6 w-6 text-white" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#74c69d' }}></span>
                    <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: '#74c69d' }}></span>
                </span>
            </button>
        );
    }

    // Minimized state - show label
    if (isMinimized) {
        return (
            <div
                className="fixed bottom-6 right-6 z-[9999] rounded-lg shadow-2xl border-2 p-4 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: '#f8faf9', borderColor: '#2ec4b6' }}
                onClick={() => setIsMinimized(false)}
            >
                <Bot className="h-5 w-5" style={{ color: '#2ec4b6' }} />
                <span className="font-bold text-gray-900 dark:text-white">Diksuchi-AI</span>
                <Maximize2 className="h-4 w-4 text-gray-600" />
            </div>
        );
    }

    // Full chat window - open state
    return (
        <div
            ref={chatContainerRef}
            className="fixed bottom-6 right-6 z-[9999] w-[400px] h-[600px] rounded-2xl shadow-2xl border-2 flex flex-col overflow-hidden"
            style={{ backgroundColor: '#f8faf9', borderColor: '#2ec4b6' }}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between" style={{ backgroundColor: '#2d6a4f' }}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bot className="h-6 w-6 text-white" />
                        <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white"></span>
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Diksuchi-AI</h3>
                        <p className="text-xs text-white/80">
                            {projectContext ? `📋 ${projectContext.title.substring(0, 25)}...` : AI_MODES[mode.toUpperCase()].desc}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                        aria-label="Minimize chat"
                    >
                        <Minimize2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                        aria-label="Close chat"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Mode Selector */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex gap-2">
                    {Object.values(AI_MODES).map((m) => {
                        const Icon = m.icon;
                        const isActive = mode === m.value;
                        return (
                            <button
                                key={m.value}
                                onClick={() => setMode(m.value)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all"
                                style={isActive ? { backgroundColor: '#2ec4b6', color: 'white' } : { backgroundColor: '#f8faf9', color: '#6b7280' }}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{m.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Credits Display */}
            <div className="px-4 py-2 border-b" style={{ backgroundColor: 'rgba(255, 183, 3, 0.1)', borderColor: '#ffb703' }}>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isPremium ? (
                            <span className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-600" />
                                Premium - Unlimited
                            </span>
                        ) : (
                            `Credits: ${credits !== null ? credits.toFixed(1) : '...'} / 50`
                        )}
                    </span>
                    {!isPremium && credits !== null && credits < 10 && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold animate-pulse">
                            Low!
                        </span>
                    )}
                </div>
            </div>

            {/* Project Context Banner */}
            {projectContext && (
                <div className="px-4 py-2 border-b" style={{ backgroundColor: 'rgba(46, 196, 182, 0.1)', borderColor: '#2ec4b6' }}>
                    <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">📋 Project Mode:</span>
                        <p className="text-xs text-blue-800 dark:text-blue-200 flex-1">
                            I can help with <strong>{projectContext.title}</strong> specific questions!
                        </p>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {conversation.length === 0 && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full" style={{ backgroundColor: 'rgba(46, 196, 182, 0.2)' }}>
                            <ModeIcon className="h-8 w-8" style={{ color: '#2ec4b6' }} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {projectContext ? `Help with ${projectContext.title}` : AI_MODES[mode.toUpperCase()].label + ' Mode'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {projectContext ? `Ask me anything about this ${Array.isArray(projectContext.techStack) ? projectContext.techStack.join(', ') : projectContext.techStack || ''} project!` : AI_MODES[mode.toUpperCase()].desc}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            Type your message below to start chatting! 💬
                        </p>
                    </div>
                )}

                {conversation.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 shadow-md ${msg.role === 'user'
                            ? 'text-white rounded-2xl rounded-tr-sm'
                            : 'text-gray-900 dark:text-white rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-700'
                            }`}
                            style={msg.role === 'user' ? { backgroundColor: '#2ec4b6' } : { backgroundColor: '#f8faf9' }}>
                            {msg.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-1">
                                    <ModeIcon className="h-3.5 w-3.5" style={{ color: '#2d6a4f' }} />
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Diksuchi-AI</span>
                                </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl rounded-tl-sm border px-4 py-3 shadow-md" style={{ backgroundColor: '#f8faf9', borderColor: '#d8e2dc' }}>
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#2ec4b6' }} />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {conversation.length > 0 && (
                    <button
                        onClick={clearChat}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2 flex items-center gap-1"
                    >
                        <X className="h-3 w-3" />
                        Clear chat
                    </button>
                )}
                <div className="flex gap-2">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows="2"
                        className="flex-1 px-3 py-2 border-2 rounded-lg resize-none focus:outline-none dark:bg-gray-700 dark:text-white text-sm"
                        style={{ borderColor: '#d8e2dc', backgroundColor: '#f8faf9' }}
                        disabled={isLoading || (!isPremium && credits === 0)}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!message.trim() || isLoading || (!isPremium && credits === 0)}
                        className="text-white px-4 self-end hover:opacity-90"
                        style={{ backgroundColor: '#2ec4b6' }}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DiksuchAI;
