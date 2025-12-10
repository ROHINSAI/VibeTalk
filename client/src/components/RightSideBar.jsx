import assets from "../assets/assets";
import React, { useContext, useMemo } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

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

  const mediaImages = useMemo(() => {
    return messages.filter((msg) => msg.image).map((msg) => msg.image);
  }, [messages]);

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

  return (
    selectedUser && (
      <div
        className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.ProfilePic || assets.avatar_icon}
            alt={selectedUser.fullName}
            className="w-20 aspect-[1/1] rounded-full"
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            <p
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-500"
              }`}
            ></p>
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto text-center">
            {selectedUser.bio || "No bio available"}
          </p>
          <div className="bg-[#282142] border border-gray-600 rounded-lg px-4 py-2 mt-2">
            <p className="text-[10px] text-gray-400">User ID</p>
            <p className="text-lg font-bold tracking-wider text-violet-400">
              {selectedUser.userId || "N/A"}
            </p>
          </div>
        </div>
        <hr className="border-[#ffffff50] my-4" />

        <div className="px-5 text-xs">
          <p>Media</p>

          {mediaImages.length > 0 ? (
            <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
              {mediaImages.map((url, index) => (
                <div
                  key={index}
                  onClick={() => window.open(url, "_blank")}
                  className="cursor-pointer rounded hover:opacity-100 transition-opacity"
                >
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-gray-400 text-center py-4">
              No media shared yet
            </div>
          )}
        </div>
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 w-[calc(100%-40px)]">
          <button
            onClick={handleRemoveFriend}
            className="w-full bg-red-600 hover:bg-red-700 text-white
               border-none text-sm font-light py-2 px-8 rounded-full cursor-pointer transition-all"
          >
            Remove Friend
          </button>
          <button
            onClick={handleBlockToggle}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white
               border-none text-sm font-light py-2 px-8 rounded-full cursor-pointer transition-all"
          >
            {isBlocked() ? "Unblock" : "Block"}
          </button>
          <button
            onClick={logout}
            className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white
               border-none text-sm font-light py-2 px-8 rounded-full cursor-pointer hover:from-purple-500 hover:to-violet-700 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default RightSidebar;
