import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Code2, Lightbulb, Loader2, Trash2, MessageSquare, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AI_MODES = {
    GENERAL: { value: 'general', label: 'General Assistant', icon: Sparkles, color: 'green-600', desc: 'General guidance & planning (0.5-1 credit)' },
    CODING: { value: 'coding', label: 'Coding Expert', icon: Code2, color: 'green-700', desc: 'Code debugging & help (1 credit)' },
    CREATIVE: { value: 'creative', label: 'Creative Thinker', icon: Lightbulb, color: 'green-800', desc: 'Ideas & brainstorming (0.5-1 credit)' }
};

const DiksuchAIPage = () => {
    const [mode, setMode] = useState('general');
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [credits, setCredits] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation, streamingMessage]);

    // Save conversation to localStorage when it changes
    useEffect(() => {
        if (conversation.length > 0) {
            localStorage.setItem('diksuchAI_pageMessages', JSON.stringify(conversation));
        }
    }, [conversation]);

    useEffect(() => {
        fetchCredits();
        loadConversationFromStorage();
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [message]);

    const fetchCredits = async () => {
        try {
            const response = await api.get('/chatbot/credits');
            setCredits(response.data.credits);
            setIsPremium(response.data.isPremium);
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        }
    };

    const loadConversationFromStorage = () => {
        try {
            setIsLoadingHistory(true);
            const savedMessages = localStorage.getItem('diksuchAI_pageMessages');
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                setConversation(parsed);
                toast.success(`Loaded ${parsed.length} previous messages! ðŸ’¬`);
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const simulateStreaming = (text) => {
        return new Promise((resolve) => {
            let index = 0;
            const words = text.split(' ');

            const interval = setInterval(() => {
                if (index < words.length) {
                    setStreamingMessage(prev => prev + (prev ? ' ' : '') + words[index]);
                    index++;
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, 35); // Faster streaming
        });
    };

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');

        // Add user message
        setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setStreamingMessage('');

        try {
            const response = await api.post('/chatbot/chat', {
                message: userMessage,
                mode,
                conversationHistory: [] // Backend now uses saved history
            });

            // Update credits if not quick response
            if (!response.data.isQuickResponse) {
                setCredits(response.data.credits);
                setIsPremium(response.data.isPremium);
            } else {
                // For quick responses, just refresh credits
                await fetchCredits();
            }

            // Simulate streaming effect
            await simulateStreaming(response.data.response);

            // Add complete AI response
            setConversation(prev => [
                ...prev,
                { role: 'assistant', content: response.data.response }
            ]);
            setStreamingMessage('');

        } catch (error) {
            console.error('Chat error:', error);

            if (error.response?.status === 403) {
                toast.error('Daily credit limit reached! ðŸ’³ Upgrade to premium for unlimited access.', {
                    duration: 5000,
                    icon: 'âš¡'
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

    const clearChat = async () => {
        try {
            setConversation([]);
            setStreamingMessage('');
            localStorage.removeItem('diksuchAI_pageMessages');
            toast.success('Conversation cleared! ðŸ—‘ï¸ Ready for a fresh start.');
        } catch (error) {
            console.error('Failed to clear conversation:', error);
            toast.error('Failed to clear conversation');
        }
    };

    const ModeConfig = AI_MODES[mode.toUpperCase()];
    const ModeIcon = ModeConfig.icon;

    // Show loading screen while fetching history
    if (isLoadingHistory) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Diksuchi-AI...</h3>
                    <p className="text-gray-600 dark:text-gray-400">Fetching your conversation history</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-950 flex overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Bot className="h-6 w-6 text-green-600 dark:text-green-500" />
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Diksuchi AI</h1>
                    </div>

                    {/* Credits Display */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        {isPremium ? (
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Premium</span>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Credits</span>
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                                        {credits !== null ? credits.toFixed(1) : '...'} / 50
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="bg-green-600 dark:bg-green-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${((credits || 0) / 50) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Mode</h3>
                    <div className="space-y-1">
                        {Object.values(AI_MODES).map((m) => {
                            const Icon = m.icon;
                            const isActive = mode === m.value;
                            return (
                                <button
                                    key={m.value}
                                    onClick={() => setMode(m.value)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                        ? 'bg-green-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium">{m.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Clear Chat Button */}
                {conversation.length > 0 && (
                    <div className="p-4">
                        <Button
                            onClick={clearChat}
                            variant="outline"
                            className="w-full text-sm"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear conversation
                        </Button>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Tips at bottom */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="text-xs list-inside ml-2 text-gray-600 dark:text-gray-400 space-y-1">
                        <li><strong>Greetings:</strong> FREE</li>
                        <li><strong>Short msgs:</strong> 0.5 credits</li>
                        <li><strong>Coding:</strong> 1 credit</li>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto p-4 space-y-6 h-full">
                        {conversation.length === 0 && !streamingMessage && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center max-w-lg">
                                    <ModeIcon className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Start a conversation
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Ask me anything about coding, get project ideas, or just say hi!
                                    </p>
                                </div>
                            </div>
                        )}

                        {conversation.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                    }`}>
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <ModeIcon className="h-3 w-3 text-green-600" />
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Diksuchi AI</span>
                                        </div>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {streamingMessage && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ModeIcon className="h-3 w-3 text-green-600 animate-pulse" />
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Diksuchi AI</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{streamingMessage}<span className="animate-pulse">â–Š</span></p>
                                </div>
                            </div>
                        )}

                        {isLoading && !streamingMessage && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex gap-3">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Message ${ModeConfig.label}...`}
                                rows="1"
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 dark:text-white max-h-32 overflow-y-auto"
                                disabled={isLoading || (!isPremium && credits === 0)}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!message.trim() || isLoading || (!isPremium && credits === 0)}
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 self-end shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                        {!isPremium && credits === 0 && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 text-center">
                                No credits remaining. Resets at midnight or upgrade to premium!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiksuchAIPage;
