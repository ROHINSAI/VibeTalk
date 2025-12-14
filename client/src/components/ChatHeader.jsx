import assets from "../assets/assets";

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
