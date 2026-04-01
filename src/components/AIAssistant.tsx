import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Wand2, HelpCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hi! I'm your NEOTOONS creative partner. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { 
        role: 'ai' as const, 
        text: "I'm here to help! You can use the Story Generator for long-form content or Viral Hooks for social media. What are you working on?" 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-4 bg-linear-to-r from-accent to-indigo-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">NEOTOONS Assistant</h3>
                  <p className="text-[10px] text-white/70">Online & Ready to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-accent text-white rounded-tr-none" 
                      : "bg-white/5 text-text-primary border border-border rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-border p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-bg/50">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-bg border border-border rounded-xl py-2.5 pl-4 pr-12 text-xs focus:outline-hidden focus:border-accent transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1">
                  <Wand2 className="w-2.5 h-2.5" /> Suggest Tool
                </button>
                <button className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1">
                  <HelpCircle className="w-2.5 h-2.5" /> How to use?
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95",
          isOpen ? "bg-card text-text-primary border border-border" : "bg-accent text-white"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default AIAssistant;
