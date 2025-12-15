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
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="h-[95%] w-[95%] sm:h-[90%] sm:w-[90%] xl:max-w-[1600px] border-none rounded-2xl box-border shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-white/10" />

        <motion.div
          layout
          transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}
          className={`rounded-2xl overflow-hidden h-full max-h-full grid min-h-0 relative z-10 ${
            (selectedUser && showRightSidebar) ||
            (selectedGroup && showGroupInfo)
              ? "grid-cols-1 md:grid-cols-[320px_1fr_300px]"
              : selectedUser || selectedGroup
              ? "grid-cols-1 md:grid-cols-[380px_1fr]"
              : "grid-cols-1 md:grid-cols-[400px_1fr]" // When only sidebar is visible or welcome screen
          }`}
        >
          {/* Sidebar */}
          <div className="min-h-0 h-full overflow-hidden">
            <SideBar />
          </div>

          {/* Chat Area */}
          <div className="min-h-0 h-full overflow-hidden">
            <ChatContainer
              showRightSidebar={showRightSidebar}
              setShowRightSidebar={setShowRightSidebar}
              showGroupInfo={showGroupInfo}
              setShowGroupInfo={setShowGroupInfo}
            />
          </div>

          {/* Right Sidebars */}
          <AnimatePresence mode="popLayout">
            {showRightSidebar && selectedUser && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full min-h-0 overflow-hidden border-l border-white/10"
              >
                <RightSideBar />
              </motion.div>
            )}
            {showGroupInfo && selectedGroup && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full min-h-0 overflow-hidden border-l border-white/10"
              >
                <GroupInfoSidebar group={selectedGroup} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
