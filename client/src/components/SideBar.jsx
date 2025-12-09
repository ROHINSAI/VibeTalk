import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ChatContext } from "../../context/ChatContext.jsx";
import { useNavigate } from "react-router-dom";

function SideBar() {
  const { users, selectedUser, setSelectedUser, unseenMessages } =
    useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="Logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-600" />
              <p onClick={logout} className="cursor-pointer text-sm">
                Log Out
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2 bg-[#282142] border border-gray-600 rounded-full px-3 py-2">
            <img alt="Search" src={assets.search_icon} className="w-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
              placeholder="Search User..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {filteredUsers.map((user) => {
          const userIdStr = String(user._id);
          const isOnline = onlineUsers?.includes(userIdStr);
          const unseenCount = unseenMessages?.[userIdStr] || 0;

          return (
            <div
              key={userIdStr}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-2 p-3 mb-3 bg-[#282142] border border-gray-600 rounded-xl cursor-pointer relative hover:bg-[#3e3a5c] ${
                selectedUser?._id === user._id ? "bg-[#4e4a7c]" : ""
              }`}
            >
              <img
                src={user.ProfilePic || assets.avatar_icon}
                alt={user.fullName}
                className="w-[35px] aspect-square rounded-full"
              />
              <div className="flex flex-col leading-5">
                <p>{user.fullName}</p>
                <p
                  className={`text-xs ${
                    isOnline ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>

              {unseenCount > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {unseenCount}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SideBar;
