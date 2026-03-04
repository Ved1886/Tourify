import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Loader, Bot, Sparkles, Trash2, ChevronDown } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

const SUGGESTIONS = [
    "Plan a 5-day trip to Jim Corbett 🌿",
    "Best wildlife sanctuaries in India 🐯",
    "Eco-friendly travel tips ♻️",
    "Hidden nature spots near me 🏔️",
];

const WELCOME_MESSAGE = {
    role: 'assistant',
    content: `Hey there, Explorer! 🌿 I'm **Tourify AI**, your personal nature travel companion.

I can help you with:
• **Day-wise trip itineraries** with dates & costs in ₹
• **Wildlife sanctuaries** and best times to visit
• **Eco-travel tips** for sustainable adventures
• **Hidden nature gems** across India and the world

What adventure shall we plan today? 🦋`,
    id: 'welcome',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

// Simple markdown-like renderer for bold and bullet points
function renderMessage(text) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Bold text: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        );

        // Bullet points
        if (line.trimStart().startsWith('•') || line.trimStart().startsWith('-')) {
            return <div key={i} className="chat-bullet">{rendered}</div>;
        }
        if (line.trim() === '') return <div key={i} style={{ height: '0.5rem' }} />;
        return <div key={i}>{rendered}</div>;
    });
}

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            scrollToBottom('smooth');
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

    useEffect(() => {
        scrollToBottom('smooth');
    }, [messages, loading]);

    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior, block: 'nearest' });
    };

    const handleScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
    };

    const buildApiMessages = (msgs) =>
        msgs
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role, content: m.content }));

    const sendMessage = async (text) => {
        const userText = (text || input).trim();
        if (!userText || loading) return;

        const userMsg = {
            role: 'user',
            content: userText,
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API}/chat`, {
                messages: buildApiMessages(updatedMessages)
            });

            const botMsg = {
                role: 'assistant',
                content: res.data.reply,
                id: Date.now() + 1,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ ${errMsg}`,
                id: Date.now() + 1,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([{ ...WELCOME_MESSAGE, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    };

    const unread = !open && messages.length > 1;

    return (
        <>
            {/* Floating Bubble */}
            <button
                className={`chat-bubble ${open ? 'chat-bubble-open' : ''}`}
                onClick={() => setOpen(o => !o)}
                aria-label="Open Tourify AI Chat"
            >
                {open ? <X size={24} /> : <MessageCircle size={24} />}
                {unread && <span className="chat-unread-dot" />}
            </button>

            {/* Chat Window */}
            {open && (
                <div className="chat-window" role="dialog" aria-label="Tourify AI Chatbot">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-header-avatar">
                                <Bot size={20} />
                                <span className="chat-online-dot" />
                            </div>
                            <div>
                                <h3>Tourify AI <Sparkles size={13} style={{ display: 'inline', color: '#0de381' }} /></h3>
                                <p>Nature travel expert · Powered by Gemini</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="chat-header-btn" onClick={clearChat} title="Clear chat">
                                <Trash2 size={15} />
                            </button>
                            <button className="chat-header-btn" onClick={() => setOpen(false)} title="Close">
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        className="chat-messages"
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                    >
                        {messages.map((msg) => (
                            <div key={msg.id}
                                className={`chat-msg-row ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="chat-msg-avatar"><Bot size={14} /></div>
                                )}
                                <div className={`chat-bubble-msg ${msg.role === 'user' ? 'bubble-user' : 'bubble-bot'} ${msg.isError ? 'bubble-error' : ''}`}>
                                    <div className="chat-msg-text">
                                        {renderMessage(msg.content)}
                                    </div>
                                    <span className="chat-msg-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {loading && (
                            <div className="chat-msg-row chat-msg-bot">
                                <div className="chat-msg-avatar"><Bot size={14} /></div>
                                <div className="chat-bubble-msg bubble-bot chat-typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll to bottom button */}
                    {showScrollBtn && (
                        <button className="chat-scroll-btn" onClick={() => scrollToBottom()}>
                            <ChevronDown size={16} />
                        </button>
                    )}

                    {/* Suggestions (only at start) */}
                    {messages.length <= 1 && (
                        <div className="chat-suggestions">
                            {SUGGESTIONS.map((s, i) => (
                                <button key={i} className="chat-suggestion-pill" onClick={() => sendMessage(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="chat-input-area">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            placeholder="Ask me anything about nature travel..."
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onInput={e => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                            }}
                        />
                        <button
                            className={`chat-send-btn ${(!input.trim() || loading) ? 'chat-send-disabled' : ''}`}
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            aria-label="Send message"
                        >
                            {loading ? <Loader size={18} className="spin" /> : <Send size={18} />}
                        </button>
                    </div>

                    <div className="chat-footer-note">
                        Tourify AI · Powered by Google Gemini
                    </div>
                </div>
            )}
        </>
    );
}
