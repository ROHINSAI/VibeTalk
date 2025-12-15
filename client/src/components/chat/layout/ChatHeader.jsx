import assets from "../../../assets/assets";
import { useContext } from "react";
import { CallContext } from "../../../../context/CallContext";
import { Phone, Video, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatHeader({
  selectedUser,
  selectedGroup,
  isOnline,
  setSelectedGroup,
  setSelectedUser,
  showGroupInfo,
  setShowGroupInfo,
  showRightSidebar,
  setShowRightSidebar,
}) {
  const { startCall } = useContext(CallContext);
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

  return (
    <div className="flex items-center py-3 gap-3 mx-4 border-b border-gray-200 dark:border-stone-500">
      {selectedGroup ? (
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
          <p className="flex-1 text-lg text-gray-900 dark:text-white flex items-center gap-2">
            {selectedGroup.name}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {selectedGroup.members?.length || 0} members
            </span>
          </p>
          <button 
            className="md:hidden text-gray-600 dark:text-gray-300"
            onClick={() => setSelectedGroup(null)}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
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
        <>
          <img
            src={selectedUser.ProfilePic || assets.avatar_icon}
            className="w-8 rounded-full"
            alt={selectedUser.fullName}
          />
          <p className="flex-1 text-lg text-gray-900 dark:text-white flex items-center gap-2">
            {selectedUser.fullName}
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400 dark:bg-gray-500"
              }`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {isOnline
                ? "Online"
                : selectedUser?.lastSeen
                ? `Last seen ${formatLastSeen(selectedUser.lastSeen)}`
                : "Offline"}
            </span>
          </p>

          {/* Call buttons for individual chat */}
          <div className="flex items-center gap-3">
             <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(124, 58, 237, 1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startCall(selectedUser, "voice")}
                className="w-10 h-10 rounded-full bg-violet-600/80 flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/10 text-white transition-colors"
                title="Voice call"
            >
                <Phone size={20} />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(124, 58, 237, 1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startCall(selectedUser, "video")}
                className="w-10 h-10 rounded-full bg-violet-600/80 flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/10 text-white transition-colors"
                title="Video call"
            >
                <Video size={20} />
            </motion.button>
          </div>

          <button 
            className="md:hidden text-gray-600 dark:text-gray-300"
            onClick={() => setSelectedUser(null)}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
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
  );
}
