import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { X, Send, User, Sparkles, Bot, Check, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { ChatContext } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const GeminiChat = ({ isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { users, setSelectedUser } = useContext(ChatContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const executeAction = async (actionData) => {
    const { action, recipient, message } = actionData;

    const targetUser = users.find((u) =>
      u.fullName.toLowerCase().includes(recipient.toLowerCase()) ||
      u.username?.toLowerCase().includes(recipient.toLowerCase())
    );

    if (!targetUser) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `I couldn't find a contact named "${recipient}".` },
      ]);
      return;
    }

    if (action === "sendMessage") {
      try {
        await axios.post(
          `http://localhost:8000/api/messages/send/${targetUser._id}`,
          { text: message },
          { withCredentials: true }
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `✅ Message sent to ${targetUser.fullName}!` },
        ]);
        toast.success(`Message sent to ${targetUser.fullName}`);
      } catch (error) {
        console.error("Failed to send message via action:", error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `❌ Failed to send message to ${targetUser.fullName}.` },
        ]);
      }
    } else if (action === "startCall") {
      setSelectedUser(targetUser);
      onClose();
      toast("Opening chat for call...", { icon: "📞" });
    }
  };

  const handleActionConfirmation = (actionData) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Please confirm this action:",
        isConfirmation: true,
        actionData
      },
    ]);
  };

  const confirmAction = (msgIndex, actionData) => {
    setMessages((prev) => prev.map((msg, idx) =>
      idx === msgIndex ? { ...msg, isConfirmation: false, content: "Action Confirmed." } : msg
    ));
    executeAction(actionData);
  };

  const cancelAction = (msgIndex) => {
    setMessages((prev) => prev.map((msg, idx) =>
      idx === msgIndex ? { ...msg, isConfirmation: false, content: "Action Cancelled." } : msg
    ));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/gemini/chat",
        {
          message: userMessage.content,
          history: messages.filter(m => !m.isConfirmation).map(m => ({ role: m.role, content: m.content })),
          contacts: users.map(u => ({ fullName: u.fullName, id: u._id })),
        },
        { withCredentials: true }
      );

      const data = response.data;

      if (data.isAction) {
        handleActionConfirmation(data.reply);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response from Gemini");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop/Overlay for mobile optional or just click outside to close logic if needed */}
          
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 border-l border-white/10 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Sparkles size={20} className="text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Gemini AI</h2>
                  <p className="text-xs text-gray-400">Your smart assistant</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                     <Sparkles size={40} className="text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">How can I help?</h3>
                  <p className="text-gray-400 text-sm max-w-[250px]">
                    I can message friends, make calls, or just chat about anything!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {["Message Syama", "Tell me a joke", "Call Rahul"].map((suggestion, i) => (
                        <button 
                            key={i}
                            onClick={() => setInput(suggestion)}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-full text-xs text-gray-300 transition-all hover:scale-105"
                        >
                            "{suggestion}"
                        </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                        msg.role === "user" 
                        ? "bg-gradient-to-br from-blue-500 to-blue-700" 
                        : "bg-gradient-to-br from-purple-500 to-purple-700"
                      }`}
                    >
                      {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                    </div>

                    <div className={`flex flex-col gap-2 max-w-[85%]`}>
                      <div
                        className={`rounded-2xl p-4 shadow-md backdrop-blur-sm ${
                          msg.role === "user"
                            ? "bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-none"
                            : "bg-gray-800/80 border border-white/5 text-gray-100 rounded-tl-none"
                        }`}
                      >
                        {msg.isConfirmation ? (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
                                <Sparkles size={14} className="text-yellow-400" />
                                <span className="font-semibold text-sm">Action Confirmation</span>
                            </div>
                            <div className="bg-black/30 p-3 rounded-lg text-xs space-y-1.5 border border-white/5">
                              <p><span className="text-gray-400">Action:</span> <span className="text-purple-300 font-mono">{msg.actionData.action}</span></p>
                              <p><span className="text-gray-400">Recipient:</span> <span className="text-white font-medium">{msg.actionData.recipient}</span></p>
                              {msg.actionData.message && (
                                <p className="italic text-gray-300">"{msg.actionData.message}"</p>
                              )}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => confirmAction(idx, msg.actionData)}
                                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Check size={14} /> Confirm
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => cancelAction(idx)}
                                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <XCircle size={14} /> Cancel
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content}
                          </p>
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
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 border border-white/5 flex items-center gap-1.5">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-2 h-2 bg-purple-400 rounded-full" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 bg-purple-400 rounded-full" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 bg-purple-400 rounded-full" 
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-white/10">
              <form onSubmit={handleSend} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur active:opacity-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Gemini..."
                  className="w-full bg-black/40 text-white rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10 placeholder-gray-500 relative z-10"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-lg transition-all z-20 shadow-lg shadow-purple-600/20"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
              <div className="text-center mt-2">
                <p className="text-[10px] text-gray-500">
                    AI can make mistakes. Verify important info.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GeminiChat;
