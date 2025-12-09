import React, { useContext } from "react";
import assets, { userDummyData } from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
function SideBar({ selectedUser, setSelectedUser }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
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
                onClick={() => {
                  navigate("/profile");
                }}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-600" />
              <p onClick={() => logout()} className="cursor-pointer text-sm">
                Log Out
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 bg-[#282142] border border-gray-600 rounded-full px-3 py-2 mt-5">
            <img alt="User Avatar" src={assets.search_icon} className="w-3" />
            <input
              type="text"
              className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
              placeholder="Search User..."
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {userDummyData.map((user, index) => (
          <div
            key={index}
            onClick={() => setSelectedUser(user)}
            className={`flex items-center gap-2 p-3 mb-3 bg-[#282142] border border-gray-600 rounded-xl cursor-pointer relative hover:bg-[#3e3a5c] ${
              selectedUser?.id === user.id && "bg-[#4e4a7c]"
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt={user?.name}
              className="w-[35px] aspect-square rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p>{user?.fullName}</p>
              {index < 3 ? (
                <p className="text-green-400 text-xs">Online</p>
              ) : (
                <p className="text-gray-400 text-xs">Offline</p>
              )}
            </div>
            {index > 2 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {index}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
