import assets from "../../../assets/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChatContext } from "../../../../context/ChatContext";
import { AuthContext } from "../../../../context/AuthContext";
import ForwardModal from "../forward/ForwardModal";
import MessageActionModal from "../modals/MessageActionModal";
import MessageInfoModal from "../modals/MessageInfoModal";
import ChatHeader from "../layout/ChatHeader";
import MessageList from "../messages/MessageList";
import MessageInput from "../input/MessageInput";
import ImagePreview from "../ui/ImagePreview";
import ScrollButton from "../ui/ScrollButton";
import useChatLogic from "../../hooks/useChatLogic";
import useMessageSender from "../../hooks/useMessageSender";

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
  const { sendAudioMessage } = useContext(ChatContext);

  const { authUser, onlineUsers, axios } = useContext(AuthContext);

  const {
    text,
    setText,
    imagePreview,
    handleImageChange,
    removeImage,
    handleSendMessage,
    handleSendVoice,
    fileInputRef,
  } = useMessageSender({ sendMessage, sendAudioMessage });
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
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-70">
            <div className="text-4xl">👋</div>
            <p className="text-lg font-medium text-gray-300">No messages yet.</p>
            <p className="text-sm text-gray-400">Start the conversation by sending a message!</p>
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
        handleSendVoice={handleSendVoice}
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
    <WelcomeView />
  );
}

const WelcomeView = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-900/50 backdrop-blur-sm relative overflow-hidden group">
             {/* Background Effects */}
             <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="relative z-10 flex flex-col items-center gap-6"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                    <motion.img 
                        src={assets.logo_icon} 
                        alt="logo" 
                        className="w-24 h-24 relative z-10 drop-shadow-2xl"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
                
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white tracking-tight">
                        Welcome to VibeTalk
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Select a chat to start messaging
                    </p>
                </div>

                <div className="flex gap-2 mt-4 opacity-50">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                </div>
            </motion.div>
        </div>
    );
};

export default ChatContainer;
