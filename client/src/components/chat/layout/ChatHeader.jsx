import assets from "../../../assets/assets";
import { useContext } from "react";
import { CallContext } from "../../../../context/CallContext";

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
    <div className="flex items-center py-3 gap-3 mx-4 border-b border-stone-500">
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
          <p className="flex-1 text-lg text-white flex items-center gap-2">
            {selectedGroup.name}
            <span className="text-xs text-gray-400 ml-2">
              {selectedGroup.members?.length || 0} members
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

          {/* Call buttons for individual chat */}
          <button
            onClick={() => startCall(selectedUser, "voice")}
            className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg"
            title="Voice call"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
          <button
            onClick={() => startCall(selectedUser, "video")}
            className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg"
            title="Video call"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </button>

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
  );
}
