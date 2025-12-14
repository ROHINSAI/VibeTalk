import React, { useState } from "react";
import toast from "react-hot-toast";

export default function MemberList({
  members = [],
  group = {},
  onlineUsers = [],
  authUser,
  axios,
  onUpdate,
}) {
  const onlineUsersList = Array.isArray(onlineUsers) ? onlineUsers : [];
  const [loadingAction, setLoadingAction] = useState(null);

  const isCurrentUserCreator =
    String(group.creator?._id || group.creator) === String(authUser?._id);
  const isCurrentUserAdmin =
    Array.isArray(group.admins) &&
    group.admins.some((a) => String(a._id || a) === String(authUser?._id));

  const canManageMembers = isCurrentUserCreator || isCurrentUserAdmin;

  const handlePromote = async (memberId) => {
    setLoadingAction(memberId);
    try {
      await axios.put(`/api/groups/${group._id}/promote/${memberId}`);
      toast.success("Member promoted to admin");
      onUpdate();
    } catch (error) {
      console.error("Promote error:", error);
      toast.error(error.response?.data?.message || "Failed to promote member");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDemote = async (memberId) => {
    setLoadingAction(memberId);
    try {
      await axios.put(`/api/groups/${group._id}/demote/${memberId}`);
      toast.success("Admin demoted");
      onUpdate();
    } catch (error) {
      console.error("Demote error:", error);
      toast.error(error.response?.data?.message || "Failed to demote admin");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemove = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setLoadingAction(memberId);
    try {
      await axios.delete(`/api/groups/${group._id}/remove/${memberId}`);
      toast.success("Member removed");
      onUpdate();
    } catch (error) {
      console.error("Remove error:", error);
      toast.error(error.response?.data?.message || "Failed to remove member");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => {
        const memberId = member._id || member.userId;
        const isOnline =
          Array.isArray(onlineUsersList) &&
          onlineUsersList.some((u) => String(u.userId) === String(memberId));
        const isAdmin = Array.isArray(group.admins)
          ? group.admins.some((a) => String(a._id || a) === String(memberId))
          : false;
        const isCreator =
          String(group.creator?._id || group.creator) === String(memberId);
        const isSelf = String(authUser?._id) === String(memberId);

        return (
          <div
            key={memberId}
            className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors"
          >
            <div className="relative">
              <img
                src={member.ProfilePic || "/avatar_icon.png"}
                alt={member.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">
                {member.fullName} {isSelf && "(You)"}
              </p>
              {(isCreator || isAdmin) && (
                <p className="text-gray-400 text-[10px]">
                  {isCreator ? "Group Creator" : "Co-Admin"}
                </p>
              )}
            </div>

            {/* Admin Actions */}
            {canManageMembers && !isSelf && !isCreator && (
              <div className="flex gap-1">
                {isCurrentUserCreator && (
                  <>
                    {isAdmin ? (
                      <button
                        onClick={() => handleDemote(memberId)}
                        disabled={loadingAction === memberId}
                        className="text-xs bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 text-white px-2 py-1 rounded transition-colors"
                        title="Demote from admin"
                      >
                        {loadingAction === memberId ? "..." : "Demote"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePromote(memberId)}
                        disabled={loadingAction === memberId}
                        className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-2 py-1 rounded transition-colors"
                        title="Promote to admin"
                      >
                        {loadingAction === memberId ? "..." : "Promote"}
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => handleRemove(memberId)}
                  disabled={loadingAction === memberId}
                  className="text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white px-2 py-1 rounded transition-colors"
                  title="Remove member"
                >
                  {loadingAction === memberId ? "..." : "Remove"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
