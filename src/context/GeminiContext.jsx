import { createContext, useState } from "react";

export const GeminiContext = createContext();

const GeminiProvider = (props) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Full conversation history (replaces single resultData)
  const [messages, setMessages] = useState([]);
  
  // Keep a separate history for Groq API context (role: user/assistant)
  const [chatHistory, setChatHistory] = useState([]);

  const onSent = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setLoading(true);

    // 1. Immediately append the user message to the visible list
    setMessages(prev => [...prev, { role: "user", content: userText }]);

    const newHistory = [...chatHistory, { role: "user", content: userText }];

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY.trim()}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: newHistory,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantText = data.choices?.[0]?.message?.content || "No response received.";

      // 2. Functional update: append assistant message to visible list
      setMessages(prev => [...prev, { role: "assistant", content: assistantText }]);

      // 3. Update the Groq API history for context in future turns
      setChatHistory([...newHistory, { role: "assistant", content: assistantText }]);

    } catch (error) {
      console.error("Groq API Error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Neural Link error. Checking frequency... [${error.message}]` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setChatHistory([]);
    setInput("");
  };

  const contextValue = {
    onSent,
    messages,
    loading,
    input,
    setInput,
    newChat,
  };

  return (
    <GeminiContext.Provider value={contextValue}>
      {props.children}
    </GeminiContext.Provider>
  );
};

export default GeminiProvider;