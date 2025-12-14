import MessageItem from "./MessageItem";

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
  return (
    <>
      {messages.map((msg, index) => (
        <MessageItem
          key={`${msg._id || "msg"}-${index}`}
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
      ))}
    </>
  );
}
