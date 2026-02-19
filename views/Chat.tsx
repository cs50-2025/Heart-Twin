import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Send, User, Bot, Sparkles, Mic, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const Chat = () => {
  const [input, setInput] = useState('');
  
  // Load messages from localStorage or default
  const [messages, setMessages] = useState<{sender: 'user'|'ai', text: string}[]>(() => {
    try {
      const saved = localStorage.getItem('ht_chat_history');
      return saved ? JSON.parse(saved) : [{ sender: 'ai', text: "Hello! I'm your Heart Twin AI assistant. How are you feeling today?" }];
    } catch (e) {
      return [{ sender: 'ai', text: "Hello! I'm your Heart Twin AI assistant. How are you feeling today?" }];
    }
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ht_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const clearChat = () => {
    const initial = [{ sender: 'ai' as const, text: "Hello! I'm your Heart Twin AI assistant. How are you feeling today?" }];
    setMessages(initial);
    localStorage.setItem('ht_chat_history', JSON.stringify(initial));
  };

  const toggleVoice = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice input is not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    };
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("No API Key");

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are a helpful cardiovascular health assistant. Keep answers brief, encouraging, and medically responsible.
            User: ${userMsg}`,
        });
        
        const text = response.text || "I'm having trouble connecting right now. Please try again.";
        setMessages(prev => [...prev, { sender: 'ai', text }]);

    } catch (err) {
        setMessages(prev => [...prev, { sender: 'ai', text: "I'm offline right now (API Key missing or network error)." }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
        <header className="mb-6 flex justify-between items-start">
             <div>
                 <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                     <Sparkles className="w-8 h-8 text-indigo-500" /> Health Assistant
                 </h1>
                 <p className="text-slate-500">Ask me anything about your workout, diet, or heart health.</p>
             </div>
             <Button variant="ghost" size="sm" onClick={clearChat} title="Clear History" className="text-slate-400 hover:text-red-500">
                 <Trash2 className="w-5 h-5" />
             </Button>
        </header>

        <Card className="flex-1 flex flex-col overflow-hidden border-indigo-100 shadow-lg shadow-indigo-100/50">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start gap-3 max-w-[80%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                                {m.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                                m.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                         <div className="flex items-center gap-2 ml-12 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                         </div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Type your health question..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={toggleVoice}
                        className={`p-3 rounded-xl transition-colors flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        title="Voice Input"
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                    <Button type="submit" disabled={!input.trim() || isTyping}>
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </Card>
    </div>
  );
};
