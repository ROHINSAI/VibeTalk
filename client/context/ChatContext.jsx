import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  const messageListenerRef = useRef(null);

  const getUsers = async () => {
    try {
      const res = await axios.get("/api/messages/users");
      setUsers(res.data.users || []);
      setUnseenMessages(res.data.unseenMessages || {});
    } catch (err) {
      console.error("getUsers error:", err);
    }
  };

  const getMessages = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`/api/messages/${userId}`);
      setMessages(res.data.messages || []);

      setUnseenMessages((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    } catch (err) {
      console.error("getMessages error:", err);
    }
  };

  const sendMessage = async ({ text, image }) => {
    if (!selectedUser) return;

    try {
      const res = await axios.post(`/api/messages/send/${selectedUser._id}`, {
        text,
        image,
      });

      const newMsg = res.data.newMessage;

      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  };

  const subscribeToMessages = () => {
    if (!socket || messageListenerRef.current) return;

    const handler = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);

        axios
          .put(`/api/messages/seen/${newMessage._id}`)
          .catch((err) => console.error("mark seen error:", err));

        setUnseenMessages((prev) => {
          const copy = { ...prev };
          delete copy[newMessage.senderId];
          return copy;
        });
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    };

    messageListenerRef.current = handler;
    socket.on("newMessage", handler);
  };

  const unsubscribeFromMessages = () => {
    if (!socket || !messageListenerRef.current) return;
    socket.off("newMessage", messageListenerRef.current);
    messageListenerRef.current = null;
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, selectedUser]);

  const value = {
    users,
    messages,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
