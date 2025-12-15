import assets from "../../../assets/assets";
import CustomAudioPlayer from "./CustomAudioPlayer";

export default function MessageItem({
  msg,
  index,
  selectedGroup,
  selectedUser,
  authUser,
  starredIds,
  recentlySeen,
  lastSeenSentMessage,
  latestSentMessageId,
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

  // Compute seen count for group messages, excluding the sender themselves
  const rawSeenArray = Array.isArray(msg.seenBy) ? msg.seenBy : [];
  const senderIdVal = selectedGroup
    ? String(msg.senderId?._id ?? msg.senderId)
    : null;
  const seenCountForDisplay = rawSeenArray.filter((s) => {
    const sid = String(s?._id ?? s);
    return sid !== senderIdVal;
  }).length;

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
          <p className="text-xs text-violet-600 dark:text-violet-400 mb-1 font-medium pl-1">
            {senderInfo.fullName}
          </p>
        )}

        {msg.audio ? (
          <div 
            className={`p-3 rounded-2xl shadow-sm ${
              isSentByMe
                ? "bg-violet-600 dark:bg-violet-500/30 text-white rounded-br-sm"
                : "bg-white dark:bg-[#4e4a7c] text-gray-900 dark:text-white border border-gray-100 dark:border-transparent rounded-bl-sm"
            }`}
          >
            <CustomAudioPlayer src={msg.audio} isSentByMe={isSentByMe} />
          </div>
        ) : msg.image ? (
          <img
            src={msg.image}
            alt="message"
            className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
          />
        ) : (
          <p
            className={`p-2.5 max-w-[200px] md:text-sm font-normal rounded-2xl break-words shadow-sm ${
              isSentByMe
                ? "bg-violet-600 dark:bg-violet-500/30 text-white rounded-br-sm"
                : "bg-white dark:bg-[#4e4a7c] text-gray-900 dark:text-white border border-gray-100 dark:border-transparent rounded-bl-sm"
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
            // Only show seen info for the latest message sent by me in the group
            msg._id === latestSentMessageId ? (
              <button
                className="text-xs text-green-400 mt-1 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoMessage(msg);
                  setIsInfoOpen(true);
                }}
                title="View seen details"
              >
                Seen by {seenCountForDisplay}
              </button>
            ) : null
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
