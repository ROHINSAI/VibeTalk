import React, { useContext, useState } from "react";
import assets from "../../assets/assets";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { ChatContext } from "../../../context/ChatContext.jsx";
import { ThemeContext } from "../../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import CreateGroupModal from "../group/modals/CreateGroupModal";
import GroupRequestsModal from "../group/modals/GroupRequestsModal";
import GeminiChat from "../chat/GeminiChat.jsx";
import { Sparkles, Search, UserPlus, Bell, Users, MessageCircle, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const { theme, toggleTheme } = useContext(ThemeContext); // Destructure theme and toggleTheme
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false);
  const [friendUserId, setFriendUserId] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupRequestsModal, setShowGroupRequestsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div
      className={`bg-white/60 dark:bg-gray-900/40 backdrop-blur-md h-full flex flex-col border-r border-gray-200 dark:border-white/5 overflow-hidden ${
        selectedUser || selectedGroup ? "max-md:hidden" : "w-full"
      }`}
    >
      {/* Header Section */}
      <div className="p-5 pb-2 shrink-0 space-y-4">
        <div className="flex justify-between items-center">
          <motion.img 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            src={assets.logo} 
            alt="Logo" 
            className="w-32 invert dark:invert-0 transition-all duration-300" 
          />
          {/* Theme Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          <div 
            className="relative py-2 group"
            onMouseEnter={() => {
                if (window.menuTimeout) clearTimeout(window.menuTimeout);
                document.getElementById('profile-menu').style.display = 'block';
                document.getElementById('profile-menu').style.opacity = '1';
                document.getElementById('profile-menu').style.transform = 'scale(1) translateY(0)';
            }}
            onMouseLeave={() => {
                window.menuTimeout = setTimeout(() => {
                    const menu = document.getElementById('profile-menu');
                    if (menu) {
                        menu.style.opacity = '0';
                        menu.style.transform = 'scale(0.95) translateY(-10px)';
                        setTimeout(() => {
                            if (menu) menu.style.display = 'none';
                        }, 200);
                    }
                }, 500);
            }}
          >
            <motion.div whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 500 }}>
                <img
                src={assets.menu_icon}
                alt="Menu"
                className="h-6 w-6 cursor-pointer opacity-80 hover:opacity-100 invert dark:invert-0"
                />
            </motion.div>
            
            <div 
                id="profile-menu"
                className="absolute top-full right-0 z-50 w-40 p-2 mt-2 rounded-xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl transform origin-top-right transition-all duration-200 ease-out"
                style={{ display: 'none', opacity: 0, transform: 'scale(0.95) translateY(-10px)' }}
            >
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200"
              >
                Edit Profile
              </p>
              <div className="h-px bg-gray-200 dark:bg-white/10 my-1" />
              <p onClick={logout} className="cursor-pointer text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 dark:text-red-300 transition-colors">
                Log Out
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100/80 dark:bg-black/20 border border-gray-200 dark:border-white/5 focus:border-purple-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 outline-none transition-all focus:bg-white dark:focus:bg-black/30"
            placeholder="Search..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddFriendModal(true)}
            className="flex-1 bg-purple-50 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10 border border-purple-200/50 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            <UserPlus size={14} className="text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300" />
            Add Friend
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFriendRequestsModal(true)}
            className="relative flex-1 bg-blue-50 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10 border border-blue-200/50 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Bell size={14} className="text-blue-500 dark:text-blue-400" />
            Requests
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg transform scale-90">
                {friendRequests.length}
              </span>
            )}
          </motion.button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-gray-100 dark:bg-black/20 rounded-xl relative border border-gray-200/50 dark:border-white/5">
          {["friends", "groups"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "friends") setSelectedGroup(null);
                else setSelectedUser(null);
              }}
              className={`flex-1 relative py-2 text-xs font-medium capitalize z-10 transition-colors duration-200 ${
                activeTab === tab ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2 relative z-10">
                {tab === "friends" ? <Users size={14} /> : <MessageCircle size={14} />}
                {tab}
                {tab === "groups" && groupRequests.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[9px] rounded-full px-1.5 py-0.5">
                    {groupRequests.length}
                  </span>
                )}
              </div>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-gray-200/50 dark:border-white/5"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Gemini Button */}
        <motion.button
          whileHover={{ scale: 1.01, backgroundColor: "rgba(147, 51, 234, 0.2)" }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsGeminiOpen(true)}
          className="w-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-200 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg dark:shadow-purple-900/10"
        >
          <Sparkles size={16} className="text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 animate-pulse" />
          Ask Gemini AI
        </motion.button>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-3 custom-scrollbar">
        <AnimatePresence mode="wait">
        {activeTab === "friends" ? (
          <motion.div
            key="friends-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-1"
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isOnline = onlineUsers?.includes(String(user._id));
                const unseenCount = unseenMessages?.[String(user._id)] || 0;
                const active = selectedUser?._id === user._id;

                return (
                  <motion.div
                    key={user._id}
                    variants={itemVariants}
                    onClick={() => {
                        setSelectedUser(active ? null : user);
                        setSelectedGroup(null);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent ${
                      active 
                        ? "bg-purple-100/80 dark:bg-purple-600/20 border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-lg text-gray-900 dark:text-white" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-200/50 dark:hover:border-white/5"
                    }`}
                  >
                    <div className="relative">
                        <img
                            src={user.ProfilePic || assets.avatar_icon}
                            alt={user.fullName}
                            className={`w-10 h-10 rounded-full object-cover transition-all ${active ? "ring-2 ring-purple-500/50" : "ring-1 ring-gray-200 dark:ring-white/10"}`}
                        />
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className={`font-medium truncate ${active ? "text-purple-900 dark:text-purple-100" : "text-gray-900 dark:text-gray-100"}`}>{user.fullName}</p>
                        {unseenCount > 0 && (
                            <span className="bg-purple-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                                {unseenCount}
                            </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${active ? "text-purple-700/70 dark:text-purple-300/70" : "text-gray-500 dark:text-gray-500"}`}>
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-gray-500 space-y-3"
              >
                <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5">
                    <Users size={24} className="opacity-50" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">No friends found</p>
                    <p className="text-xs opacity-60">Try adding a new friend!</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="groups-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-1"
          >
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const active = selectedGroup?._id === group._id;
                return (
                  <motion.div
                    key={group._id}
                    variants={itemVariants}
                    onClick={() => {
                        setSelectedGroup(active ? null : group);
                        setSelectedUser(null);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent ${
                        active 
                          ? "bg-purple-100/80 dark:bg-purple-600/20 border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-lg text-gray-900 dark:text-white" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-200/50 dark:hover:border-white/5"
                      }`}
                  >
                    <div className="relative">
                        {group.groupPic ? (
                        <img
                            src={group.groupPic}
                            alt={group.name}
                            className={`w-10 h-10 rounded-full object-cover ${active ? "ring-2 ring-purple-500/50" : "ring-1 ring-gray-200 dark:ring-white/10"}`}
                        />
                        ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            active ? "bg-purple-500 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300"
                        }`}>
                            {group.name.charAt(0).toUpperCase()}
                        </div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${active ? "text-purple-900 dark:text-purple-100" : ""}`}>{group.name}</p>
                      <p className={`text-xs truncate ${active ? "text-purple-700/70 dark:text-purple-300/70" : "text-gray-500 dark:text-gray-500"}`}>
                        {group.members?.length || 0} members
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-gray-500 space-y-3"
              >
                <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5">
                    <MessageCircle size={24} className="opacity-50" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">No groups yet</p>
                    <p className="text-xs opacity-60">Create one to get started!</p>
                </div>
              </motion.div>
            )}

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateGroupModal(true)}
              className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold py-3 px-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <div className="bg-white/20 p-0.5 rounded-full"><Users size={12} /></div>
              Create New Group
            </motion.button>

            {groupRequests.length > 0 && (
              <motion.button
                variants={itemVariants}
                onClick={() => setShowGroupRequestsModal(true)}
                className="w-full mt-2 bg-amber-50 dark:bg-white/5 hover:bg-amber-100 dark:hover:bg-white/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-200 text-xs font-medium py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                View Invitations
                <span className="bg-amber-500 text-white text-[10px] rounded-full px-1.5">{groupRequests.length}</span>
              </motion.button>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1a1625] border border-white/20 dark:border-white/10 rounded-2xl p-6 w-80 shadow-2xl relative overflow-hidden"
          > 
             {/* Modal Background Splash */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Add Friend</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Enter their 6-digit User ID below</p>
            
            <input
              type="text"
              value={friendUserId}
              onChange={(e) =>
                setFriendUserId(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              maxLength={6}
              className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-gray-900 dark:text-white text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-purple-500/50 transition-colors placeholder-gray-400 dark:placeholder-gray-700"
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddFriendModal(false);
                  setFriendUserId("");
                }}
                className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFriend}
                disabled={friendUserId.length !== 6}
                className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-900/20"
              >
                Send Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Friend Requests Modal */}
      {showFriendRequestsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Friend Requests</h3>
              <button
                onClick={() => setShowFriendRequestsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>
            
            {friendRequests.length > 0 ? (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 shadow-sm dark:shadow-none"
                  >
                    <img
                      src={request.sender.ProfilePic || assets.avatar_icon}
                      alt={request.sender.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-200 truncate">{request.sender.fullName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        ID: {request.sender.userId}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => acceptFriendRequest(request._id)}
                        className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineFriendRequest(request._id)}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-600/20 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500 py-12 flex flex-col items-center">
                <Bell size={32} className="opacity-20 mb-3" />
                <p className="text-sm">No new requests</p>
              </div>
            )}
          </motion.div>
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
