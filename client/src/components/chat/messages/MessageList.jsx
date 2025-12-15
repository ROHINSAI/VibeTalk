import MessageItem from "./MessageItem";
import MessageDate from "./MessageDate";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageList({
  messages,
  selectedGroup,
  selectedUser,
  authUser,
  starredIds,
  recentlySeen,
  lastSeenSentMessage,
  axios,
  removeStarLocal,
  setActionMessage,
  setIsActionOpen,
  setInfoMessage,
  setIsInfoOpen,
}) {
  // helper to get date key in MM/DD/YYYY format
  const getDateKey = (iso) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  let lastDateKey = null;

  // compute latest message sent by the current auth user (most recent in list)
  const latestSentMessageId = (() => {
    if (!messages || messages.length === 0) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      const senderId = m.senderId?._id ?? m.senderId;
      if (String(senderId) === String(authUser?._id)) return m._id;
    }
    return null;
  })();

  return (
    <>
      <AnimatePresence mode="popLayout">
      {messages.map((msg, index) => {
        const dateKey = getDateKey(msg.createdAt);
        const showDate = dateKey !== lastDateKey;
        lastDateKey = dateKey;

        return (
          <motion.div 
            key={`${msg._id || "msg"}-${index}`}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full"
          >
            {showDate && (
                <div className="opacity-80 hover:opacity-100 transition-opacity">
                    <MessageDate dateString={dateKey} />
                </div>
            )}
            <MessageItem
              latestSentMessageId={latestSentMessageId}
              msg={msg}
              index={index}
              selectedGroup={selectedGroup}
              selectedUser={selectedUser}
              authUser={authUser}
              starredIds={starredIds}
              recentlySeen={recentlySeen}
              lastSeenSentMessage={lastSeenSentMessage}
              axios={axios}
              removeStarLocal={removeStarLocal}
              setActionMessage={setActionMessage}
              setIsActionOpen={setIsActionOpen}
              setInfoMessage={setInfoMessage}
              setIsInfoOpen={setIsInfoOpen}
            />
          </motion.div>
        );
      })}
      </AnimatePresence>
    </>
  );
}
