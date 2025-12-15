import MessageItem from "./MessageItem";
import MessageDate from "./MessageDate";

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
      {messages.map((msg, index) => {
        const dateKey = getDateKey(msg.createdAt);
        const showDate = dateKey !== lastDateKey;
        lastDateKey = dateKey;

        return (
          <div key={`${msg._id || "msg"}-${index}`}>
            {showDate && <MessageDate dateString={dateKey} />}
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
          </div>
        );
      })}
    </>
  );
}
