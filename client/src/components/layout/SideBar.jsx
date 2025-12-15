import React, { useContext, useState } from "react";
import assets from "../../assets/assets";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { ChatContext } from "../../../context/ChatContext.jsx";
import { useNavigate } from "react-router-dom";
import CreateGroupModal from "../group/modals/CreateGroupModal";
import GroupRequestsModal from "../group/modals/GroupRequestsModal";
import GeminiChat from "../chat/GeminiChat.jsx"; // Corrected import path and typo
import { Sparkles } from "lucide-react"; // Added Sparkles icon for Gemini button

function SideBar() {
  const {
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    groups,
    selectedGroup,
    setSelectedGroup,
    groupRequests,
    getGroups,
    getGroupRequests,
  } = useContext(ChatContext);

  const {
    logout,
    onlineUsers,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false);
  const [friendUserId, setFriendUserId] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupRequestsModal, setShowGroupRequestsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [isGeminiOpen, setIsGeminiOpen] = useState(false); // New state for Gemini chat

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFriend = async () => {
    if (friendUserId.trim().length === 6) {
      await sendFriendRequest(friendUserId.trim());
      setFriendUserId("");
      setShowAddFriendModal(false);
    }
  };

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        !selectedUser && !selectedGroup ? "max-md:hidden" : ""
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
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowAddFriendModal(true)}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs py-2 px-3 rounded-full transition-colors"
          >
            Add Friend
          </button>
          <button
            onClick={() => setShowFriendRequestsModal(true)}
            className="relative flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-full transition-colors"
          >
            Requests
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab selector */}
        <div className="mt-4 flex gap-2 bg-[#1a1625] p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab("friends");
              setSelectedGroup(null);
            }}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "friends"
                ? "bg-violet-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => {
              setActiveTab("groups");
              setSelectedUser(null);
            }}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors relative ${
              activeTab === "groups"
                ? "bg-violet-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Groups
            {groupRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {groupRequests.length}
              </span>
            )}
          </button>
        </div>
        {/* Gemini Chat Button */}
        <button
          onClick={() => setIsGeminiOpen(true)}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded-full transition-colors flex items-center justify-center gap-2"
          title="Gemini Assistant"
        >
          <Sparkles size={16} />
          Gemini Assistant
        </button>
      </div>

      <div className="flex flex-col">
        {activeTab === "friends" ? (
          // Friends List
          filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const userIdStr = String(user._id);
              const isOnline = onlineUsers?.includes(userIdStr);
              const unseenCount = unseenMessages?.[userIdStr] || 0;

              return (
                <div
                  key={userIdStr}
                  onClick={() => {
                    setSelectedUser(
                      selectedUser && selectedUser._id === user._id
                        ? null
                        : user
                    );
                    setSelectedGroup(null);
                  }}
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
            })
          ) : (
            <div className="text-center text-gray-400 mt-10">
              <p className="text-sm">No friends yet</p>
              <p className="text-xs mt-2">Add friends to start chatting!</p>
            </div>
          )
        ) : (
          // Groups List
          <>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                return (
                  <div
                    key={group._id}
                    onClick={() => {
                      setSelectedGroup(
                        selectedGroup && selectedGroup._id === group._id
                          ? null
                          : group
                      );
                      setSelectedUser(null);
                    }}
                    className={`flex items-center gap-2 p-3 mb-3 bg-[#282142] border border-gray-600 rounded-xl cursor-pointer relative hover:bg-[#3e3a5c] ${
                      selectedGroup?._id === group._id ? "bg-[#4e4a7c]" : ""
                    }`}
                  >
                    {group.groupPic ? (
                      <img
                        src={group.groupPic}
                        alt={group.name}
                        className="w-[35px] h-[35px] rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-[35px] h-[35px] rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col leading-5 flex-1">
                      <p>{group.name}</p>
                      <p className="text-xs text-gray-400">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 mt-10">
                <p className="text-sm">No groups yet</p>
                <p className="text-xs mt-2">Create a group to get started!</p>
              </div>
            )}

            {/* Create Group Button */}
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span>
              Create Group
            </button>

            {groupRequests.length > 0 && (
              <button
                onClick={() => setShowGroupRequestsModal(true)}
                className="relative w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white text-xs py-2 px-3 rounded-full transition-colors"
              >
                Invitations
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {groupRequests.length}
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#282142] border border-gray-600 rounded-xl p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Add Friend</h3>
            <p className="text-sm text-gray-400 mb-4">
              Enter the 6-digit User ID
            </p>
            <input
              type="text"
              value={friendUserId}
              onChange={(e) =>
                setFriendUserId(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              maxLength={6}
              className="w-full bg-[#1a1625] border border-gray-600 rounded-lg px-4 py-2 text-white text-center text-lg tracking-widest outline-none focus:border-violet-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAddFriendModal(false);
                  setFriendUserId("");
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFriend}
                disabled={friendUserId.length !== 6}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friend Requests Modal */}
      {showFriendRequestsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#282142] border border-gray-600 rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Friend Requests</h3>
              <button
                onClick={() => setShowFriendRequestsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {friendRequests.length > 0 ? (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center gap-3 bg-[#1a1625] border border-gray-600 rounded-lg p-3"
                  >
                    <img
                      src={request.sender.ProfilePic || assets.avatar_icon}
                      alt={request.sender.fullName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{request.sender.fullName}</p>
                      <p className="text-xs text-gray-400">
                        ID: {request.sender.userId}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(request._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineFriendRequest(request._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                No friend requests
              </p>
            )}
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        open={showCreateGroupModal}
        onClose={() => {
          setShowCreateGroupModal(false);
          getGroups();
        }}
      />

      {/* Group Requests Modal */}
      <GroupRequestsModal
        open={showGroupRequestsModal}
        onClose={() => setShowGroupRequestsModal(false)}
        requests={groupRequests}
        onUpdate={() => {
          getGroupRequests();
          getGroups();
        }}
      />

      <GeminiChat isOpen={isGeminiOpen} onClose={() => setIsGeminiOpen(false)} />
    </div>
  );
}

export default SideBar;
