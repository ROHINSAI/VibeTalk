import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Media Section Component
function MediaSection({ group, axios }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [group?._id, axios]);

  if (loading) {
    return (
      <div className="p-4 border-b border-gray-700">
        <h4 className="text-white font-semibold mb-2">Media</h4>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="p-4 border-b border-gray-700">
        <h4 className="text-white font-semibold mb-2">Media</h4>
        <p className="text-gray-400 text-sm">No media yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-700">
      <h4 className="text-white font-semibold mb-3">Media ({media.length})</h4>
      <div className="grid grid-cols-3 gap-2">
        {media.map((msg) => (
          <div key={msg._id} className="aspect-square">
            <img
              src={msg.image}
              alt="Media"
              className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(msg.image, "_blank")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GroupInfoSidebar({ open, onClose, group }) {
  const { authUser, axios } = useContext(AuthContext);
  const { onlineUsers, setGroups, setSelectedGroup } = useContext(ChatContext);
  const [searchTerm, setSearchTerm] = useState("");

  if (!open || !group) return null;

  // defensive: ensure members and onlineUsers are arrays
  const members = Array.isArray(group?.members) ? group.members : [];
  const onlineUsersList = Array.isArray(onlineUsers) ? onlineUsers : [];

  const handleLeaveGroup = async () => {
    try {
      await axios.delete(`/api/groups/${group._id}/leave`);
      setGroups((prev) => prev.filter((g) => g._id !== group._id));
      setSelectedGroup(null);
      toast.success("Left the group");
      onClose();
    } catch (err) {
      console.error("Leave group error:", err);
      toast.error(err.response?.data?.message || "Failed to leave group");
    }
  };

  // Filter members by search term
  const filteredMembers = members.filter((member) =>
    String(member.fullName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Count online members
  const onlineMembersCount = members.filter(
    (member) =>
      Array.isArray(onlineUsersList) &&
      onlineUsersList.some(
        (u) => String(u.userId) === String(member._id || member.userId)
      )
  ).length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-gray-800 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold">Group Info</h2>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
          ×
        </button>
      </div>

      {/* Group Profile */}
      <div className="flex flex-col items-center p-6 border-b border-gray-700">
        {group.groupPic ? (
          <img
            src={group.groupPic}
            alt={group.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {group.name?.[0]?.toUpperCase() || "G"}
            </span>
          </div>
        )}
        <h3 className="text-white font-semibold text-lg mt-3">{group.name}</h3>
        {group.description && (
          <p className="text-gray-400 text-sm text-center mt-1">
            {group.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-gray-400 text-sm">
            {members.length} members
          </span>
          {onlineMembersCount > 0 && (
            <>
              <span className="text-gray-600">•</span>
              <span className="text-green-400 text-sm">
                {onlineMembersCount} online
              </span>
            </>
          )}
        </div>
      </div>

      {/* Media Section */}
      <MediaSection group={group} axios={axios} />

      {/* Members Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h4 className="text-white font-semibold mb-3">
            Members ({members.length})
          </h4>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 mb-3"
          />

          {/* Members List */}
          <div className="flex flex-col gap-2">
            {filteredMembers.map((member) => {
              const isOnline =
                Array.isArray(onlineUsersList) &&
                onlineUsersList.some(
                  (u) =>
                    String(u.userId) === String(member._id || member.userId)
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
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-700"
                >
                  <div className="relative">
                    {member.ProfilePic ? (
                      <img
                        src={member.ProfilePic}
                        alt={member.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {member.fullName?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{member.fullName}</p>
                    {(isCreator || isAdmin) && (
                      <p className="text-gray-400 text-xs">
                        {isCreator ? "Creator" : "Admin"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredMembers.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No members found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leave Group Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLeaveGroup}
          className="w-full px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Leave Group
        </button>
      </div>
    </div>
  );
}
