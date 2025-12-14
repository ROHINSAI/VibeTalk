import { useEffect, useRef, useState } from "react";

export default function useChatLogic({
  selectedUser,
  selectedGroup,
  getMessages,
  getGroupMessages,
  messages,
  authUser,
  scrollToMessageId,
  setScrollToMessageId,
}) {
  const scrollEnd = useRef(null);
  const messagesRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [recentlySeen, setRecentlySeen] = useState(new Set());
  const prevMessagesRef = useRef([]);

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
    else if (selectedGroup) getGroupMessages(selectedGroup._id);
  }, [selectedUser, selectedGroup, getMessages, getGroupMessages]);

  useEffect(() => {
    if (!messagesRef.current) return;

    const el = messagesRef.current;
    const distanceFromBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (isAtBottom || distanceFromBottom < 150) {
      scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
    }

    if (scrollToMessageId) {
      const targetEl = document.getElementById(`msg-${scrollToMessageId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        setScrollToMessageId(null);
      }
    }
  }, [messages, isAtBottom, scrollToMessageId, setScrollToMessageId]);

  useEffect(() => {
    try {
      const prev = prevMessagesRef.current || [];
      const prevSeen = new Set(
        prev
          .filter((m) => m && m.senderId === authUser?._id && m.seen)
          .map((m) => m._id)
      );
      const currSeen = new Set(
        messages
          .filter((m) => m && m.senderId === authUser?._id && m.seen)
          .map((m) => m._id)
      );
      const newlySeen = Array.from(currSeen).filter((id) => !prevSeen.has(id));
      if (newlySeen.length > 0) {
        setRecentlySeen((prev) => new Set([...Array.from(prev), ...newlySeen]));
        setTimeout(() => {
          setRecentlySeen((prev) => {
            const copy = new Set(Array.from(prev));
            newlySeen.forEach((id) => copy.delete(id));
            return copy;
          });
        }, 900);
      }
      prevMessagesRef.current = messages;
    } catch (e) {
      console.warn("seen animation detection failed:", e);
    }
  }, [messages, authUser?._id]);

  const lastSeenSentMessage = messages
    .slice()
    .reverse()
    .find((m) => m.senderId === authUser?._id && m.seen);

  return {
    scrollEnd,
    messagesRef,
    isAtBottom,
    setIsAtBottom,
    recentlySeen,
    lastSeenSentMessage,
  };
}
