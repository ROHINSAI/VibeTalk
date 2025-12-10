import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [starredIds, setStarredIds] = useState(new Set());
  const [scrollToMessageId, setScrollToMessageId] = useState(null);

  const { socket, axios } = useContext(AuthContext);
  const messageListenerRef = useRef(null);
  const messageDeletedListenerRef = useRef(null);
  const messageEditedListenerRef = useRef(null);

  const getUsers = async () => {
    try {
      const res = await axios.get("/api/messages/users");
      setUsers(res.data.users || []);
      setUnseenMessages(res.data.unseenMessages || {});
    } catch (err) {
      console.error("getUsers error:", err);
    }
  };

  const getStarredIds = async () => {
    try {
      const res = await axios.get("/api/messages/starred");
      const starred = res.data.starred || [];
      setStarredIds(new Set(starred.map((m) => m._id)));
    } catch (err) {
      console.error("getStarredIds error:", err);
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

  const addStarLocal = (messageId) => {
    setStarredIds((prev) => new Set([...Array.from(prev), messageId]));
  };

  const removeStarLocal = (messageId) => {
    setStarredIds((prev) => {
      const copy = new Set(Array.from(prev));
      copy.delete(messageId);
      return copy;
    });
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

  const removeMessage = (messageId) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  const updateMessage = (updated) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === updated._id ? { ...m, ...updated } : m))
    );
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
    const delHandler = (data) => {
      const { messageId } = data;
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };
    messageDeletedListenerRef.current = delHandler;
    socket.on("messageDeleted", delHandler);
    const seenHandler = (data) => {
      const { messageIds } = data || {};
      if (!messageIds || !messageIds.length) return;
      setMessages((prev) =>
        prev.map((m) => (messageIds.includes(m._id) ? { ...m, seen: true } : m))
      );
    };
    socket.on("messagesSeen", seenHandler);
    const editHandler = (updatedMsg) => {
      if (!updatedMsg || !updatedMsg._id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMsg._id ? { ...m, ...updatedMsg } : m
        )
      );
    };
    messageEditedListenerRef.current = editHandler;
    socket.on("messageEdited", editHandler);
    // store ref for cleanup
    messageDeletedListenerRef.current._seenHandler = seenHandler;
  };

  const unsubscribeFromMessages = () => {
    if (!socket || !messageListenerRef.current) return;
    socket.off("newMessage", messageListenerRef.current);
    messageListenerRef.current = null;
    if (messageDeletedListenerRef.current) {
      socket.off("messageDeleted", messageDeletedListenerRef.current);
      if (messageDeletedListenerRef.current._seenHandler) {
        socket.off(
          "messagesSeen",
          messageDeletedListenerRef.current._seenHandler
        );
      }
      messageDeletedListenerRef.current = null;
    }
    if (messageEditedListenerRef.current) {
      socket.off("messageEdited", messageEditedListenerRef.current);
      messageEditedListenerRef.current = null;
    }
  };

  useEffect(() => {
    getUsers();
    getStarredIds();
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
    starredIds,
    addStarLocal,
    removeStarLocal,
    updateMessage,
    scrollToMessageId,
    setScrollToMessageId,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    removeMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
