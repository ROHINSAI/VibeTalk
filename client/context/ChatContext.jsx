import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [starredIds, setStarredIds] = useState(new Set());
  const [scrollToMessageId, setScrollToMessageId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupRequests, setGroupRequests] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);

  const { socket, axios, authUser } = useContext(AuthContext);
  const messageListenerRef = useRef(null);
  const messageDeletedListenerRef = useRef(null);
  const messageEditedListenerRef = useRef(null);
  const groupMessageListenerRef = useRef(null);
  const groupUpdatedListenerRef = useRef(null);
  const groupRequestListenerRef = useRef(null);

  const getUsers = async () => {
    try {
      // Ensure token is set before making request
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("/api/messages/users");
      setUsers(res.data.users || []);
      setUnseenMessages(res.data.unseenMessages || {});
    } catch (err) {
      console.error("getUsers error:", err);
    }
  };

  const getStarredIds = async () => {
    try {
      // Ensure token is set before making request
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("/api/messages/starred");
      const starred = res.data.starred || [];
      setStarredIds(new Set(starred.map((m) => m._id)));
    } catch (err) {
      console.error("getStarredIds error:", err);
    }
  };

  const getGroups = async () => {
    try {
      // Ensure token is set before making request
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("/api/groups");
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error("getGroups error:", err);
    }
  };

  const getGroupRequests = async () => {
    try {
      // Ensure token is set before making request
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("/api/groups/requests");
      setGroupRequests(res.data.requests || []);
    } catch (err) {
      console.error("getGroupRequests error:", err);
    }
  };

  const getMessages = async (userId) => {
    if (!userId) return;
    setMessages([]); // Clear previous messages
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

  const getGroupMessages = async (groupId) => {
    if (!groupId) return;
    setMessages([]); // Clear previous messages
    try {
      // client-side guard: if we have the group locally and user is not a member, skip request
      const localGroup = groups.find((g) => String(g._id) === String(groupId));
      if (
        localGroup &&
        authUser &&
        Array.isArray(localGroup.members) &&
        !localGroup.members.some(
          (m) => String(m._id || m) === String(authUser._id)
        )
      ) {
        console.warn(
          "Skipped getGroupMessages: user is not a member (client-side)"
        );
        // clear messages to avoid stale view and return
        setMessages([]);
        return;
      }

      const res = await axios.get(`/api/groups/${groupId}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("getGroupMessages error:", err);
      const status = err?.response?.status;
      // If server responds 403, the user is not a member — clear selection, refresh groups and notify
      if (status === 403) {
        try {
          setSelectedGroup(null);
          // refresh groups to ensure local group membership is up-to-date
          await getGroups();
          // notify user clearly
          const msg =
            err.response?.data?.message || "You are not a member of this group";
          toast.error(msg);
        } catch (e) {
          console.warn("Error handling 403 in getGroupMessages:", e);
        }
      } else {
        // for other errors, surface a friendly message
        toast.error(
          err.response?.data?.message || "Failed to load group messages"
        );
      }
      // log request details to help debug cross-origin/auth issues
      try {
        console.debug(
          "getGroupMessages request:",
          err?.config?.method,
          err?.config?.url
        );
      } catch (e) {
        /* ignore */
      }
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

  const sendMessage = async ({ text, image, audio } = {}) => {
    if (selectedGroup) {
      try {
        const res = await axios.post(
          `/api/groups/${selectedGroup._id}/messages`,
          {
            text,
            image,
            audio,
            replyTo: replyMessage?._id,
          }
        );
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
        setReplyMessage(null);
      } catch (err) {
        console.error("sendGroupMessage error:", err);
      }
    } else if (selectedUser) {
      try {
        const res = await axios.post(`/api/messages/send/${selectedUser._id}`, {
          text,
          image,
          audio,
          replyTo: replyMessage?._id,
        });
        const newMsg = res.data.newMessage;
        setMessages((prev) => [...prev, newMsg]);
        setReplyMessage(null);
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    }
  };

  const sendAudioMessage = async ({ audioBlob, waveformBlob, text = "" }) => {
    if (!audioBlob) return null;
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");
      if (waveformBlob)
        formData.append("waveform", waveformBlob, "waveform.png");
      if (text) formData.append("text", text);

      toast.loading("Uploading voice message...");

      let res;
      if (selectedGroup) {
        res = await axios.post(
          `/api/groups/${selectedGroup._id}/messages`,
          formData
        );
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
        toast.dismiss();
        toast.success("Voice message sent");
        return newMsg;
      } else if (selectedUser) {
        res = await axios.post(
          `/api/messages/send/${selectedUser._id}`,
          formData
        );
        const newMsg = res.data.newMessage;
        setMessages((prev) => [...prev, newMsg]);
        toast.dismiss();
        toast.success("Voice message sent");
        return newMsg;
      }
      toast.dismiss();
      return null;
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to upload voice message");
      console.error("sendAudioMessage error:", err);
      return null;
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

    // Group message listener
    const groupMsgHandler = (newMessage) => {
      if (selectedGroup && newMessage.groupId === selectedGroup._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    groupMessageListenerRef.current = groupMsgHandler;
    socket.on("newGroupMessage", groupMsgHandler);

    // Group updated listener
    const groupUpdatedHandler = (updatedGroup) => {
      setGroups((prev) =>
        prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
      if (selectedGroup && selectedGroup._id === updatedGroup._id) {
        setSelectedGroup(updatedGroup);
      }
    };
    groupUpdatedListenerRef.current = groupUpdatedHandler;
    socket.on("groupUpdated", groupUpdatedHandler);

    // Group request listener
    const groupReqHandler = (newRequest) => {
      setGroupRequests((prev) => [newRequest, ...prev]);
    };
    groupRequestListenerRef.current = groupReqHandler;
    socket.on("newGroupRequest", groupReqHandler);

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
    if (groupMessageListenerRef.current) {
      socket.off("newGroupMessage", groupMessageListenerRef.current);
      groupMessageListenerRef.current = null;
    }
    if (groupUpdatedListenerRef.current) {
      socket.off("groupUpdated", groupUpdatedListenerRef.current);
      groupUpdatedListenerRef.current = null;
    }
    if (groupRequestListenerRef.current) {
      socket.off("newGroupRequest", groupRequestListenerRef.current);
      groupRequestListenerRef.current = null;
    }
  };

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (authUser) {
      getUsers();
      getStarredIds();
      getGroups();
      getGroupRequests();
    }
  }, [authUser]);

  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, selectedUser, selectedGroup]);

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
    groups,
    selectedGroup,
    setSelectedGroup,
    groupRequests,
    getGroups,
    getGroupRequests,
    getGroupMessages,
    replyMessage,
    setReplyMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
