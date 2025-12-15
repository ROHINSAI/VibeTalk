import assets from "../../assets/assets";
import React, { useContext, useMemo } from "react";
import { ChatContext } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const {
    logout,
    onlineUsers,
    removeFriend,
    blockUser,
    unblockUser,
    authUser,
  } = useContext(AuthContext);

  const mediaImages = useMemo(
    () => messages.filter((msg) => msg.image).map((msg) => msg.image),
    [messages]
  );

  const isOnline =
    selectedUser && onlineUsers?.includes(String(selectedUser._id));

  const handleRemoveFriend = () => {
    if (
      window.confirm(
        `Are you sure you want to remove ${selectedUser.fullName} from your friends?`
      )
    ) {
      removeFriend(selectedUser._id);
    }
  };

  const isBlocked = () => {
    if (!authUser || !authUser.blocked) return false;
    return authUser.blocked.map(String).includes(String(selectedUser._id));
  };

  const handleBlockToggle = () => {
    if (isBlocked()) {
      unblockUser(selectedUser._id);
    } else {
      if (
        window.confirm(
          `Block ${selectedUser.fullName}? They won't be able to send you friend requests.`
        )
      ) {
        blockUser(selectedUser._id);
      }
    }
  };

  if (!selectedUser) return null;

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border-l border-white/10 text-white w-full h-full flex flex-col overflow-hidden">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-y-contain">
        <div className="pt-10 pb-6 flex flex-col items-center gap-3 text-sm font-light px-6">
          <div className="relative">
            <img
              src={selectedUser?.ProfilePic || assets.avatar_icon}
              alt={selectedUser.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-800 shadow-xl"
            />
            {isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></span>
            )}
          </div>
          
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold tracking-wide">
              {selectedUser.fullName}
            </h1>
            <p className="text-gray-400 text-xs max-w-[200px] mx-auto leading-relaxed">
              {selectedUser.bio || "Hey there! I'm using VibeTalk."}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-2 w-full max-w-[220px] text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">User ID</p>
            <p className="text-sm font-mono text-purple-300 truncate select-all">
              {selectedUser.userId || selectedUser._id || "N/A"}
            </p>
          </div>
        </div>

        <div className="px-6 font-medium text-sm text-gray-300 mb-2">Shared Media</div>
        {mediaImages.length > 0 ? (
          <div className="px-6 grid grid-cols-2 gap-2 pb-6">
            {mediaImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer group relative aspect-square rounded-lg overflow-hidden bg-gray-800"
              >
                <img
                  src={url}
                  alt={`Shared ${index}`}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 pb-6 text-center text-gray-500 text-xs italic">
            No media shared yet
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="p-4 bg-black/20 backdrop-blur-lg border-t border-white/5 flex flex-col gap-3 shrink-0">
        <button
          onClick={handleRemoveFriend}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-sm font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          Remove Friend
        </button>
        <button
          onClick={handleBlockToggle}
          className="w-full bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 border border-white/10 text-sm font-medium py-2.5 px-4 rounded-xl transition-all"
        >
          {isBlocked() ? "Unblock User" : "Block User"}
        </button>
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 text-sm font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all mt-1"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
