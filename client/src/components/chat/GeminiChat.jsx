import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { X, Send, User, Sparkles, Bot, Check, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { ChatContext } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const GeminiChat = ({ isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get users (friends) from ChatContext to pass to Gemini
  const { users, setSelectedUser } = useContext(ChatContext);
  const { socket } = useContext(AuthContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const executeAction = async (actionData) => {
    console.log("Executing Action:", actionData);
    const { action, recipient, message, type } = actionData;

    // Find the user
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
                {
                    text: message,
                },
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
    // Remove confirmation buttons from the message visually or update state
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
        const botMessage = {
            role: "assistant",
            content: data.reply,
        };
        setMessages((prev) => [...prev, botMessage]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response from Gemini");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
        <div className="flex items-center gap-2 text-purple-400">
          <Sparkles size={20} />
          <h2 className="text-lg font-semibold text-white">Gemini Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 space-y-2">
            <Sparkles size={48} className="mx-auto opacity-50 text-purple-500" />
            <p>I can help you message friends or make calls! Try saying "Message [Name]..."</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" ? "bg-blue-600" : "bg-purple-600"
              }`}
            >
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`flex flex-col gap-2 max-w-[80%]`}>
                <div
                    className={`rounded-lg p-3 text-sm ${
                        msg.role === "user"
                        ? "bg-blue-600/20 text-blue-100"
                        : "bg-purple-600/20 text-purple-100"
                    }`}
                >
                    {msg.isConfirmation ? (
                        <div className="flex flex-col gap-2">
                            <p className="font-semibold text-white">Using action: {msg.actionData.action}</p>
                            <div className="bg-gray-800 p-2 rounded text-xs text-gray-300">
                                <p><span className="text-gray-400">To:</span> {msg.actionData.recipient}</p>
                                {msg.actionData.message && <p><span className="text-gray-400">Message:</span> "{msg.actionData.message}"</p>}
                                {msg.actionData.type && <p><span className="text-gray-400">Type:</span> {msg.actionData.type}</p>}
                            </div>
                            <div className="flex gap-2 mt-1">
                                <button 
                                    onClick={() => confirmAction(idx, msg.actionData)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                    <Check size={14} /> Send
                                </button>
                                <button 
                                    onClick={() => cancelAction(idx)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                    <XCircle size={14} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content
                    )}
                </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot size={16} />
            </div>
            <div className="bg-purple-600/20 rounded-lg p-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSend} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-md transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default GeminiChat;
