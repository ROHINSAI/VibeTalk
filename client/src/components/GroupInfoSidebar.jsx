import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function GroupInfoSidebar({ group }) {
  const { authUser, axios } = useContext(AuthContext);
  const { onlineUsers, setGroups, setSelectedGroup } = useContext(ChatContext);
  const [media, setMedia] = useState([]);

  if (!group) return null;

  // defensive: ensure members and onlineUsers are arrays
  const members = Array.isArray(group?.members) ? group.members : [];
  const onlineUsersList = Array.isArray(onlineUsers) ? onlineUsers : [];

  useEffect(() => {
    const fetchMedia = async () => {
      if (!group?._id) return;
      try {
        const res = await axios.get(`/api/groups/${group._id}/messages`);
        const messages = res.data.messages || [];
        const mediaMessages = messages.filter((m) => m.image).slice(-12); // Last 12 media
        setMedia(mediaMessages);
      } catch (err) {
        console.error("Failed to fetch media:", err);
      }
    };
    fetchMedia();
  }, [group?._id, axios]);

  const handleLeaveGroup = async () => {
    try {
      await axios.delete(`/api/groups/${group._id}/leave`);
      setGroups((prev) => prev.filter((g) => g._id !== group._id));
      setSelectedGroup(null);
      toast.success("Left the group");
    } catch (err) {
      console.error("Leave group error:", err);
      toast.error(err.response?.data?.message || "Failed to leave group");
    }
  };

  // Count online members
  const onlineMembersCount = members.filter(
    (member) =>
      Array.isArray(onlineUsersList) &&
      onlineUsersList.some(
        (u) => String(u.userId) === String(member._id || member.userId)
      )
  ).length;

  return (
    <div
      className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll max-md:hidden`}
    >
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        {group.groupPic ? (
          <img
            src={group.groupPic}
            alt={group.name}
            className="w-20 aspect-[1/1] rounded-full object-cover"
          />
        ) : (
          <div className="w-20 aspect-[1/1] rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {group.name?.[0]?.toUpperCase() || "G"}
            </span>
          </div>
        )}

        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {group.name}
        </h1>
        {group.description && (
          <p className="px-10 mx-auto text-center text-gray-300">
            {group.description}
          </p>
        )}
        <div className="bg-[#282142] border border-gray-600 rounded-lg px-4 py-2 mt-2 flex gap-4">
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Members</p>
            <p className="text-lg font-bold tracking-wider text-violet-400">
              {members.length}
            </p>
          </div>
          <div className="text-center border-l border-gray-600 pl-4">
            <p className="text-[10px] text-gray-400">Online</p>
            <p className="text-lg font-bold tracking-wider text-green-400">
              {onlineMembersCount}
            </p>
          </div>
        </div>
      </div>
      <hr className="border-[#ffffff50] my-4" />

      {/* Media Section */}
      <div className="px-5 text-xs">
        <p>Media</p>
        {media.length > 0 ? (
          <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {media.map((msg, index) => (
              <div
                key={msg._id || index}
                onClick={() => window.open(msg.image, "_blank")}
                className="cursor-pointer rounded hover:opacity-100 transition-opacity"
              >
                <img
                  src={msg.image}
                  alt={`Media`}
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

      <hr className="border-[#ffffff50] my-4" />

      {/* Members Section */}
      <div className="px-5 text-xs mb-20">
        <p className="mb-2">Members ({members.length})</p>
        <div className="flex flex-col gap-2">
          {members.map((member) => {
            const isOnline =
              Array.isArray(onlineUsersList) &&
              onlineUsersList.some(
                (u) => String(u.userId) === String(member._id || member.userId)
              );
            const isAdmin = Array.isArray(group.admins)
              ? group.admins.some(
                  (a) => String(a) === String(member._id || member.userId)
                )
              : false;
            const isCreator =
              String(group.creator) === String(member._id || member.userId);

            return (
              <div
                key={member._id || member.userId}
                className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors"
              >
                <div className="relative">
                  <img
                    src={member.ProfilePic || "/avatar_icon.png"} // Fallback handling provided by src or error
                    alt={member.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{member.fullName}</p>
                  {(isCreator || isAdmin) && (
                    <p className="text-gray-400 text-[10px]">
                      {isCreator ? "Group Creator" : "Admin"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 w-[calc(100%-40px)] bg-[#1a1625] pt-2">
        <button
          onClick={handleLeaveGroup}
          className="w-full bg-red-600 hover:bg-red-700 text-white
             border-none text-sm font-light py-2 px-8 rounded-full cursor-pointer transition-all shadow-lg"
        >
          Leave Group
        </button>
      </div>
    </div>
  );
}
