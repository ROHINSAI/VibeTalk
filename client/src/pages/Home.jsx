import { useContext, useState } from "react";
import RightSideBar from "../components/layout/RightSideBar";
import SideBar from "../components/layout/SideBar";
import ChatContainer from "../components/chat/ChatContainer";
import GroupInfoSidebar from "../components/group/GroupInfoSidebar";
import { ChatContext } from "../../context/ChatContext";

function Home() {
  const { selectedUser, selectedGroup } = useContext(ChatContext);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center">
      <div className="h-[95%] w-[95%] sm:h-[90%] sm:w-[70%] border rounded-2xl box-border">
        <div
          className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid min-h-0 grid-cols-1 relative ${
            (selectedUser && showRightSidebar) ||
            (selectedGroup && showGroupInfo)
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : selectedUser || selectedGroup
              ? "md:grid-cols-[1fr_2fr]"
              : "md:grid-cols-2"
          }`}
        >
          <SideBar />

          <ChatContainer
            showRightSidebar={showRightSidebar}
            setShowRightSidebar={setShowRightSidebar}
            showGroupInfo={showGroupInfo}
            setShowGroupInfo={setShowGroupInfo}
          />

          {showRightSidebar && selectedUser && <RightSideBar />}
          {showGroupInfo && selectedGroup && (
            <GroupInfoSidebar group={selectedGroup} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
