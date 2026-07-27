import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2, Info, AlertTriangle, ArrowLeft } from 'lucide-react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const SymptomChat = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I am your MediAI assistant. Please describe the symptoms you are experiencing, and I will help you understand what might be going on and which specialist you should see.'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Send the entire conversation history for context chaining
            const { data } = await api.post('/chat', {
                messages: [...messages, userMessage]
            });

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I am having trouble connecting to my service right now. Please try again in a moment.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] font-sans overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header - Glass Look */}
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-6 flex items-center justify-between shadow-sm shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-12 h-12 flex items-center justify-center bg-white hover:bg-slate-50 rounded-[1.25rem] text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="premium-gradient p-3 rounded-[1.25rem] shadow-lg shadow-indigo-100">
                            <Bot className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-none tracking-tight">MediAI Triage</h2>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Diagnosis Node</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2.5 border border-red-100 shadow-sm transition-all hover:bg-red-600 hover:text-white group">
                        <AlertTriangle size={16} className="group-hover:animate-bounce" />
                        <span className="uppercase tracking-[0.15em]">Not for critical care</span>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-10 space-y-10 scroll-smooth relative z-10 custom-scrollbar"
            >
                <div className="max-w-4xl mx-auto space-y-10">
                    <AnimatePresence initial={false}>
                        {messages.map((message, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-5 max-w-[90%] sm:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-premium ring-4 ring-white ${message.role === 'user' ? 'premium-gradient text-white' : 'bg-white text-indigo-600 border border-slate-100'
                                        }`}>
                                        {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>

                                    <div className={`p-6 rounded-[2rem] shadow-premium text-sm sm:text-lg leading-relaxed font-medium tracking-tight ${message.role === 'user'
                                        ? 'premium-gradient text-white rounded-tr-none'
                                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none ring-1 ring-slate-100'
                                        }`}>
                                        {message.content.split('\n').map((line, i) => (
                                            <p key={i} className={i > 0 ? 'mt-4 border-t border-white/10 pt-4' : ''}>
                                                {line}
                                            </p>
                                        ))}

                                        {message.role === 'assistant' && (
                                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-2 opacity-40">
                                                <Info size={12} className="text-slate-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Logic Engine • v4.2</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-5 max-w-[75%] items-end">
                                <div className="shrink-0 w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm relative">
                                    <Loader2 size={20} className="animate-spin" />
                                </div>
                                <div className="bg-white border border-slate-100 p-5 rounded-[1.8rem] rounded-tl-none flex flex-col gap-3 shadow-premium ring-1 ring-slate-100">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assistant Analyzing Symptoms...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Input Area - Floating Experience */}
            <div className="px-6 py-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent shrink-0 z-50">
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSend}
                        className="relative flex items-center group"
                    >
                        <div className="absolute inset-0 bg-indigo-600/5 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            placeholder="Describe your clinical symptoms in detail..."
                            className="flex-1 bg-white border border-slate-200 rounded-[2rem] pl-10 pr-20 py-7 text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 shadow-premium transition-all outline-none text-lg font-medium relative z-10"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`absolute right-3 w-16 h-16 rounded-2xl transition-all flex items-center justify-center z-20 ${!input.trim() || isLoading
                                ? 'bg-slate-100 text-slate-300'
                                : 'premium-gradient text-white shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95'
                                }`}
                        >
                            <Send size={24} className={isLoading ? 'opacity-0' : 'opacity-100'} />
                            {isLoading && <Loader2 size={24} className="absolute animate-spin" />}
                        </button>
                    </form>

                    <div className="flex items-center justify-center gap-8 mt-6">
                        <div className="flex items-center gap-2">
                            <Info size={12} className="text-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">MediAI Secure Encryption</p>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Guidance Engine v4</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SymptomChat;
