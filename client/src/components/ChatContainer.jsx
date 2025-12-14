import assets from "../assets/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import ForwardModal from "./ForwardModal";
import MessageActionModal from "./MessageActionModal";
import MessageInfoModal from "./MessageInfoModal";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ImagePreview from "./ImagePreview";
import ScrollButton from "./ScrollButton";
import useChatLogic from "./useChatLogic";
import useMessageSender from "./useMessageSender";

function ChatContainer({
  showRightSidebar,
  setShowRightSidebar,
  showGroupInfo,
  setShowGroupInfo,
}) {
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

  const {
    text,
    setText,
    imagePreview,
    handleImageChange,
    removeImage,
    handleSendMessage,
    fileInputRef,
  } = useMessageSender({ sendMessage });
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const {
    scrollEnd,
    messagesRef,
    isAtBottom,
    setIsAtBottom,
    recentlySeen,
    lastSeenSentMessage,
  } = useChatLogic({
    selectedUser,
    selectedGroup,
    getMessages,
    getGroupMessages,
    messages,
    authUser,
    scrollToMessageId,
    setScrollToMessageId,
  });

  const isOnline =
    selectedUser && onlineUsers?.includes(String(selectedUser._id));

  // The last message sent by me that was seen by the recipient.

  return selectedUser || selectedGroup ? (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        isOnline={isOnline}
        setSelectedGroup={setSelectedGroup}
        setSelectedUser={setSelectedUser}
        showGroupInfo={showGroupInfo}
        setShowGroupInfo={setShowGroupInfo}
        showRightSidebar={showRightSidebar}
        setShowRightSidebar={setShowRightSidebar}
      />

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
          <MessageList
            messages={messages}
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
        )}
        <div ref={scrollEnd} />
      </div>

      {!isAtBottom && (
        <ScrollButton
          onClick={() => {
            scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
            setIsAtBottom(true);
          }}
        />
      )}

      <ImagePreview imagePreview={imagePreview} removeImage={removeImage} />

      <MessageInput
        text={text}
        setText={setText}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        handleSendMessage={handleSendMessage}
        fileInputRef={fileInputRef}
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

      <ForwardModal
        open={isForwardOpen}
        onClose={() => setIsForwardOpen(false)}
        message={forwardingMessage}
      />

      <MessageInfoModal
        open={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        message={infoMessage}
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
