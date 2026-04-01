import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, HelpCircle, Lightbulb, BookOpen, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AIGuideAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hey! I'm your AI guide. What would you like to create today? Ask me anything about our tools, or I can suggest the perfect one for your next project." }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');

    // Mock response for now
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Great question! Here's what I recommend: Use **Story Generator** if you want a full narrative, or **Viral Hooks** if you're building social media content. Both generate ideas in seconds. Want to try one?" 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 bg-card/90 backdrop-blur-xl border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-6 bg-linear-to-r from-accent to-indigo-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Guide</h3>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Online & Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white/2">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-accent text-white rounded-tr-none" 
                      : "bg-white/5 text-text-primary border border-border rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="px-6 py-2 flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-border text-[10px] font-bold text-text-muted hover:text-white hover:border-accent transition-all flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" /> What tool should I use?
              </button>
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-border text-[10px] font-bold text-text-muted hover:text-white hover:border-accent transition-all flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Show me trending ideas
              </button>
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-border text-[10px] font-bold text-text-muted hover:text-white hover:border-accent transition-all flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> How do I create?
              </button>
            </div>

            {/* Input */}
            <div className="p-6 border-t border-border bg-white/2">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="w-full bg-bg border border-border rounded-2xl py-3 pl-4 pr-12 text-xs focus:outline-hidden focus:border-accent transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:bg-accent/10 rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-linear-to-br from-accent to-indigo-600 text-white shadow-2xl shadow-accent/20 flex items-center justify-center relative group"
      >
        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default AIGuideAssistant;
