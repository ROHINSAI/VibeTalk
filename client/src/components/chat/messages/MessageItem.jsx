import assets from "../../../assets/assets";

export default function MessageItem({
  msg,
  index,
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
  const isSentByMe = selectedGroup
    ? String(msg.senderId?._id) === String(authUser?._id)
    : msg.senderId === authUser?._id;

  const senderInfo = selectedGroup && msg.senderId;

  return (
    <div
      data-msgid={`${msg._id || "noid"}-${index}`}
      id={`msg-${msg._id || "noid"}-${index}`}
      className={`flex items-end gap-2 mb-4 ${
        isSentByMe ? "justify-end" : "justify-start"
      }`}
    >
      {!isSentByMe && (
        <img
          src={
            selectedGroup
              ? senderInfo?.ProfilePic || assets.avatar_icon
              : selectedUser.ProfilePic || assets.avatar_icon
          }
          alt="avatar"
          className="w-7 h-7 rounded-full"
        />
      )}

      <div
        className={`flex flex-col ${
          isSentByMe ? "items-end" : "items-start"
        } relative`}
        onContextMenu={(e) => {
          e.preventDefault();
          setActionMessage(msg);
          setIsActionOpen(true);
        }}
      >
        {selectedGroup && !isSentByMe && senderInfo && (
          <p className="text-xs text-violet-400 mb-1 font-medium">
            {senderInfo.fullName}
          </p>
        )}

        {msg.image ? (
          <img
            src={msg.image}
            alt="message"
            className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
          />
        ) : (
          <p
            className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-words ${
              isSentByMe
                ? "bg-violet-500/30 text-white rounded-br-none"
                : "bg-[#4e4a7c] text-white rounded-bl-none"
            }`}
          >
            {msg.text}
          </p>
        )}

        <p className="text-gray-500 text-xs mt-1">
          {(() => {
            const d = new Date(msg.createdAt);
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            return `${hh}:${mm}`;
          })()}
          {msg.edited && (
            <span className="text-gray-400 italic text-[11px] ml-2">
              (edited)
            </span>
          )}
        </p>

        {isSentByMe &&
          (selectedGroup ? (
            <button
              className="text-xs text-green-400 mt-1 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setInfoMessage(msg);
                setIsInfoOpen(true);
              }}
              title="View seen details"
            >
              Seen by {Array.isArray(msg.seenBy) ? msg.seenBy.length : 0}
            </button>
          ) : (
            lastSeenSentMessage &&
            msg._id === lastSeenSentMessage._id && (
              <p
                className={`text-xs text-green-400 mt-1 ${
                  recentlySeen.has(msg._id) ? "seen-animate" : ""
                }`}
              >
                Seen
              </p>
            )
          ))}

        {starredIds.has(msg._id) && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await axios.delete(`/api/messages/star/${msg._id}`);
                removeStarLocal(msg._id);
              } catch (err) {
                console.error("unstar error:", err);
              }
            }}
            className="absolute -top-2 right-0 text-yellow-400"
            title="Starred"
          >
            ★
          </button>
        )}
      </div>

      {isSentByMe && (
        <img
          src={authUser.ProfilePic || assets.avatar_icon}
          alt="avatar"
          className="w-7 h-7 rounded-full"
        />
      )}
    </div>
  );
}
