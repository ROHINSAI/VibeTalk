import { useContext, useState } from "react";
import RightSideBar from "../components/layout/RightSideBar";
import SideBar from "../components/layout/SideBar";
import ChatContainer from "../components/chat/container/ChatContainer";
import GroupInfoSidebar from "../components/group/GroupInfoSidebar";
import { ChatContext } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";

function Home() {
  const { selectedUser, selectedGroup } = useContext(ChatContext);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-gray-100/50 dark:bg-black/20 backdrop-blur-sm">
      <div className="h-[95%] w-[95%] sm:h-[90%] sm:w-[90%] xl:max-w-[1600px] border-none rounded-2xl box-border shadow-2xl relative">
        <div className="absolute inset-0 bg-white/80 dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-black/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-inner" />
        
        <motion.div
          layout
          transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}
          className={`rounded-2xl overflow-hidden h-full max-h-full grid min-h-0 relative z-10 
            grid-cols-1 
            ${
            (selectedUser && showRightSidebar) ||
            (selectedGroup && showGroupInfo)
              ? "md:grid-cols-[320px_1fr_300px]"
              : selectedUser || selectedGroup
              ? "md:grid-cols-[380px_1fr]"
              : "md:grid-cols-[400px_1fr]"
          }`}
        >
          {/* Sidebar - Hidden on mobile if chat or info is open */}
          <div className={`min-h-0 h-full overflow-hidden ${
             (selectedUser || selectedGroup) ? "hidden md:block" : "block"
          }`}>
            <SideBar />
          </div>

          {/* Chat Area - Hidden on mobile if info is open or no chat selected */}
          <div className={`min-h-0 h-full overflow-hidden ${
              (!selectedUser && !selectedGroup) ? "hidden md:block" : 
              ((showRightSidebar || showGroupInfo) ? "hidden md:block" : "block")
          }`}>
            <ChatContainer
              showRightSidebar={showRightSidebar}
              setShowRightSidebar={setShowRightSidebar}
              showGroupInfo={showGroupInfo}
              setShowGroupInfo={setShowGroupInfo}
            />
          </div>

          {/* Right Sidebars - Full screen on mobile when active */}
          <AnimatePresence mode="popLayout">
            {showRightSidebar && selectedUser && (
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="col-span-1 h-full min-h-0 overflow-hidden border-l border-white/10 md:relative absolute inset-0 z-20 bg-white dark:bg-gray-900"
              >
                <RightSideBar onClose={() => setShowRightSidebar(false)} />
              </motion.div>
            )}
            {showGroupInfo && selectedGroup && (
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="col-span-1 h-full min-h-0 overflow-hidden border-l border-white/10 md:relative absolute inset-0 z-20 bg-white dark:bg-gray-900"
              >
                <GroupInfoSidebar 
                   group={selectedGroup} 
                   onClose={() => setShowGroupInfo(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
