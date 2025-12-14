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
