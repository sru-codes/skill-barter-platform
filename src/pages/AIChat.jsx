import { useState, useRef, useEffect, useContext } from "react";
import { GeminiContext } from "../context/GeminiContext";
import { Send, Bot, User, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChat() {
  const { messages, loading, onSent, input, setInput, newChat } = useContext(GeminiContext);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSent();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Skill Assistant</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Smart Assistant · Powered by LLaMA 3.3
            </p>
          </div>
        </div>

        {/* New Chat Button */}
        {messages.length > 0 && (
          <button
            onClick={newChat}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600 rounded-xl transition-all italic"
          >
            <RotateCcw size={14} />
            New Chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>

          {/* Empty State */}
          {messages.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <Bot className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">How can I help you?</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Ask me anything about skills, learning paths, or barter strategies.</p>
              </div>
            </motion.div>
          )}

          {/* Full Conversation History — map through ALL messages */}
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-indigo-600"
                    : "bg-slate-800 border border-slate-700"
                }`}>
                  {msg.role === "user"
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-indigo-400" />
                  }
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/10"
                    : "bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 rounded-tl-none">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Auto-Scroll Anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900/80 border-t border-slate-800 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {messages.length > 0 && (
          <p className="text-center text-[10px] text-slate-700 font-black uppercase tracking-widest italic mt-3">
            {messages.length} messages in chat
          </p>
        )}
      </form>
    </div>
  );
}
