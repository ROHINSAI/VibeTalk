import assets from "../../../assets/assets";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { useContext } from "react";
import { ChatContext } from "../../../../context/ChatContext.jsx";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { Reply } from "lucide-react";

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

  const { setReplyMessage } = useContext(ChatContext);
  
  // Framer Motion Swipe Logic
  const controls = useAnimation();
  const x = useMotionValue(0);
  const replyIconOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  const replyIconScale = useTransform(x, [0, 50, 100], [0.5, 0.8, 1.2]);

  const handleDragEnd = async (event, info) => {
    const offset = info.offset.x;
    if (offset > 80) { // Trigger threshold
      setReplyMessage(msg);
      if (navigator.vibrate) navigator.vibrate(50);
    }
    // Snap back
    controls.start({ x: 0 });
  };

  return (
    <div
      data-msgid={`${msg._id || "noid"}-${index}`}
      id={`msg-${msg._id || "noid"}-${index}`}
      className={`flex items-end gap-2 mb-4 relative ${
        isSentByMe ? "justify-end" : "justify-start"
      }`}
    >
        {/* Reply Icon Indicator */}
        <motion.div 
            style={{ opacity: replyIconOpacity, scale: replyIconScale, x: -30 }}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-0 flex items-center justify-center
                ${isSentByMe ? "mr-[90%]" : "mr-0"}
            `}
        >
            <div className="w-8 h-8 bg-violet-600/20 dark:bg-violet-400/20 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Reply size={18} />
            </div>
        </motion.div>

      <motion.div
        className={`flex items-end gap-2 w-full relative z-10 ${
            isSentByMe ? "justify-end" : "justify-start"
        }`}
        drag="x"
        dragConstraints={{ left: 0, right: 100 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, touchAction: "pan-y" }} // pan-y ensures vertical scrolling still works
      >
          {!isSentByMe && (
            <img
              src={
                selectedGroup
                  ? senderInfo?.ProfilePic || assets.avatar_icon
                  : selectedUser.ProfilePic || assets.avatar_icon
              }
              alt="avatar"
              className="w-7 h-7 rounded-full select-none pointer-events-none"
            />
          )}

          <div
            className={`flex flex-col ${
              isSentByMe ? "items-end" : "items-start"
            } relative max-w-[80%]`}
            onContextMenu={(e) => {
              e.preventDefault();
              setActionMessage(msg);
              setIsActionOpen(true);
            }}
            onDoubleClick={() => {
                setReplyMessage(msg);
            }}
            title="Double click or Swipe to reply"
          >
            {selectedGroup && !isSentByMe && senderInfo && (
              <p className="text-xs text-violet-600 dark:text-violet-400 mb-1 font-medium pl-1 select-none">
                {senderInfo.fullName}
              </p>
            )}

            {/* Reply Display */}
            {msg.replyTo && (
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        // MessageItem uses data-msgid `${msg._id}-${index}`
                        // We target the first instance found (usually the correct one)
                        const el = document.querySelector(`[data-msgid^="${msg.replyTo._id}"]`);
                        if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            const bubble = el.querySelector(".p-2\\.5") || el.querySelector(".p-3") || el;
                            bubble.classList.add("ring-2", "ring-purple-500", "ring-offset-2", "dark:ring-offset-gray-900", "transition-all", "duration-500");
                            setTimeout(() => bubble.classList.remove("ring-2", "ring-purple-500", "ring-offset-2", "dark:ring-offset-gray-900", "transition-all", "duration-500"), 2000);
                        } else {
                            // Fallback: Message might not be loaded if using pagination
                        }
                    }}
                    className={`mb-1 p-2 rounded-lg text-xs border-l-[3px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                    isSentByMe 
                    ? "bg-black/5 dark:bg-black/10 border-violet-200 dark:border-violet-400/50 text-white/90" 
                    : "bg-gray-50 dark:bg-gray-800/50 border-purple-500 text-gray-700 dark:text-gray-300"
                }`}>
                    <p className="font-semibold mb-0.5 opacity-80 text-[10px] uppercase tracking-wide select-none">
                        {msg.replyTo.senderId === authUser?._id ? "You" : "Replying to"}
                    </p>
                    <p className="line-clamp-1 opacity-90 font-medium select-none">
                        {msg.replyTo.text || (msg.replyTo.audio ? "🎤 Voice Message" : "📷 Image")}
                    </p>
                </div>
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
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden select-none"
              />
            ) : (
              <p
                className={`p-2.5 max-w-[200px] md:text-sm font-normal rounded-2xl break-words shadow-sm select-text ${
                  isSentByMe
                    ? "bg-violet-600 dark:bg-violet-500/30 text-white rounded-br-sm"
                    : "bg-white dark:bg-[#4e4a7c] text-gray-900 dark:text-white border border-gray-100 dark:border-transparent rounded-bl-sm"
                }`}
              >
                {msg.text}
              </p>
            )}

            <p className="text-gray-500 text-xs mt-1 select-none">
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
                    className="text-xs text-green-400 mt-1 hover:underline select-none"
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
                    className={`text-xs text-green-400 mt-1 select-none ${
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
                className="absolute -top-2 right-0 text-yellow-400 select-none"
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
              className="w-7 h-7 rounded-full select-none pointer-events-none"
            />
          )}

      </motion.div>
    </div>
  );
}
