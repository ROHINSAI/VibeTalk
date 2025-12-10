import assets from "../assets/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import ForwardModal from "./ForwardModal";
import MessageActionModal from "./MessageActionModal";
import GroupInfoSidebar from "./GroupInfoSidebar";

function ChatContainer({ showRightSidebar, setShowRightSidebar }) {
  const {
    selectedUser,
    setSelectedUser,
    messages,
    getMessages,
    sendMessage,
    removeMessage,
    starredIds,
    addStarLocal,
    removeStarLocal,
    scrollToMessageId,
    setScrollToMessageId,
    selectedGroup,
    setSelectedGroup,
    getGroupMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers, axios } = useContext(AuthContext);

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const scrollEnd = useRef(null);
  const messagesRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [recentlySeen, setRecentlySeen] = useState(new Set());
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const fileInputRef = useRef(null);
  const prevMessagesRef = useRef([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    }
  }, [selectedUser, selectedGroup, getMessages, getGroupMessages]);

  useEffect(() => {
    if (!messagesRef.current) return;

    const el = messagesRef.current;
    const distanceFromBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight);
    // if user is at/near bottom, scroll; otherwise leave their position
    if (isAtBottom || distanceFromBottom < 150) {
      scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
    }

    // If there's a request to scroll to a specific message, attempt it
    if (scrollToMessageId) {
      const targetEl = document.getElementById(`msg-${scrollToMessageId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        // clear the target after scrolling
        setScrollToMessageId(null);
      }
    }
  }, [messages, isAtBottom, scrollToMessageId, setScrollToMessageId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const isOnline =
    selectedUser && onlineUsers?.includes(String(selectedUser._id));

  const formatLastSeen = (iso) => {
    if (!iso) return "";
    const t = new Date(iso);
    const diff = Date.now() - t.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return t.toLocaleString();
  };

  // The last message sent by me that was seen by the recipient.
  const lastSeenSentMessage = messages
    .slice()
    .reverse()
    .find((m) => m.senderId === authUser?._id && m.seen);

  // Detect messages that newly became seen so we can animate the Seen label.
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
        // clear after animation duration
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

  return selectedUser || selectedGroup ? (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center py-3 gap-3 mx-4 border-b border-stone-500">
        {selectedGroup ? (
          // Group Header
          <>
            {selectedGroup.groupPic ? (
              <img
                src={selectedGroup.groupPic}
                className="w-8 h-8 rounded-full object-cover"
                alt={selectedGroup.name}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                {selectedGroup.name.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="flex-1 text-lg text-white flex items-center gap-2">
              {selectedGroup.name}
              <span className="text-xs text-gray-400 ml-2">
                {selectedGroup.members?.length || 0} members
                {(() => {
                  const onlineCount =
                    selectedGroup.members?.filter((member) =>
                      onlineUsers.some(
                        (u) =>
                          String(u.userId) ===
                          String(member._id || member.userId)
                      )
                    ).length || 0;
                  return onlineCount > 0 ? ` • ${onlineCount} online` : "";
                })()}
              </span>
            </p>
            <img
              src={assets.arrow_icon}
              alt="Arrow Icon"
              className="md:hidden w-7 cursor-pointer"
              onClick={() => setSelectedGroup(null)}
            />
            <img
              src={assets.help_icon}
              alt="help"
              className={`max-md:hidden w-5 cursor-pointer transition-all ${
                showGroupInfo
                  ? "opacity-100 scale-110"
                  : "opacity-70 hover:opacity-100"
              }`}
              onClick={() => setShowGroupInfo(!showGroupInfo)}
            />
          </>
        ) : (
          // User Header
          <>
            <img
              src={selectedUser.ProfilePic || assets.avatar_icon}
              className="w-8 rounded-full"
              alt={selectedUser.fullName}
            />
            <p className="flex-1 text-lg text-white flex items-center gap-2">
              {selectedUser.fullName}
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-600" : "bg-gray-500"
                }`}
              />
              <span className="text-xs text-gray-400 ml-2">
                {isOnline
                  ? "Online"
                  : selectedUser?.lastSeen
                  ? `Last seen ${formatLastSeen(selectedUser.lastSeen)}`
                  : "Offline"}
              </span>
            </p>
            <img
              src={assets.arrow_icon}
              alt="Arrow Icon"
              className="md:hidden w-7 cursor-pointer"
              onClick={() => setSelectedUser(null)}
            />
            <img
              src={assets.help_icon}
              alt="help"
              className={`max-md:hidden w-5 cursor-pointer transition-all ${
                showRightSidebar
                  ? "opacity-100 scale-110"
                  : "opacity-70 hover:opacity-100"
              }`}
              onClick={() => setShowRightSidebar(!showRightSidebar)}
            />
          </>
        )}
      </div>

      <div
        ref={messagesRef}
        onScroll={() => {
          const el = messagesRef.current;
          if (!el) return;
          const distanceFromBottom =
            el.scrollHeight - (el.scrollTop + el.clientHeight);
          setIsAtBottom(distanceFromBottom < 150);
        }}
        className="flex-1 overflow-y-auto p-3 pb-4 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSentByMe = selectedGroup
              ? String(msg.senderId?._id) === String(authUser?._id)
              : msg.senderId === authUser?._id;
            const senderInfo = selectedGroup && msg.senderId;
            return (
              <div
                key={`${msg._id || "noid"}-${index}`}
                data-msgid={msg._id || index}
                id={`msg-${msg._id || index}`}
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
                  {/* Show sender name for group messages */}
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
                    {formatMessageTime(msg.createdAt)}
                    {msg.edited && (
                      <span className="text-gray-400 italic text-[11px] ml-2">
                        (edited)
                      </span>
                    )}
                  </p>

                  {/* show 'Seen' under the latest sent message when receiver has seen it */}
                  {isSentByMe &&
                    lastSeenSentMessage &&
                    msg._id === lastSeenSentMessage._id && (
                      <p
                        className={`text-xs text-green-400 mt-1 ${
                          recentlySeen.has(msg._id) ? "seen-animate" : ""
                        }`}
                      >
                        Seen
                      </p>
                    )}

                  {/* show star icon only when message is starred */}
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

                  {/* right-click opens action modal */}
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
          })
        )}
        <div ref={scrollEnd} />
      </div>

      {/* Scroll-to-bottom button when user scrolled up */}
      {!isAtBottom && (
        <div className="absolute right-6 bottom-24">
          <button
            onClick={() => {
              scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
              setIsAtBottom(true);
            }}
            className="bg-violet-500/80 text-white px-3 py-1 rounded-full shadow-lg"
          >
            ↓ New
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="mx-3 mb-2 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-[150px] rounded-lg border border-gray-600"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-3 p-3"
      >
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input
            ref={fileInputRef}
            type="file"
            id="image"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleImageChange}
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="Upload"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <button type="submit">
          <img
            src={assets.send_button}
            alt="Send"
            className="w-7 cursor-pointer"
          />
        </button>
      </form>
      <ForwardModal
        open={isForwardOpen}
        onClose={() => setIsForwardOpen(false)}
        message={forwardingMessage}
      />
      <MessageActionModal
        open={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        message={actionMessage}
        onForward={(msg) => {
          setForwardingMessage(msg);
          setIsForwardOpen(true);
        }}
      />
      <GroupInfoSidebar
        open={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        group={selectedGroup}
      />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
      <img src={assets.logo_icon} alt="logo" className="max-w-16" />
      <p className="text-white text-lg font-medium">Chat Anytime Anywhere</p>
    </div>
  );
}

export default ChatContainer;
