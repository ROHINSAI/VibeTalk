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
    <div className="flex flex-col gap-2 pb-4">
      {members.map((member, index) => {
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
            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/5"
          >
            <div className="relative shrink-0">
              <img
                src={member.ProfilePic || "/avatar_icon.png"}
                alt={member.fullName}
                className="w-9 h-9 rounded-full object-cover"
              />
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-gray-900 dark:text-gray-200 text-sm font-medium truncate">
                    {member.fullName} {isSelf && <span className="text-gray-500 dark:text-gray-500 font-normal">(You)</span>}
                </p>
                {isAdmin && !isCreator && (
                     <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/20">ADMIN</span>
                )}
                {isCreator && (
                     <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/20">OWNER</span>
                )}
              </div>
              <p className="text-gray-500 text-[10px] truncate">
                 {member.bio || "No bio available"}
              </p>
            </div>

            {/* Admin Actions */}
            {canManageMembers && !isSelf && !isCreator && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isCurrentUserCreator && (
                  <>
                    {isAdmin ? (
                      <button
                        onClick={() => handleDemote(memberId)}
                        disabled={loadingAction === memberId}
                        className="text-[10px] bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 px-2 py-1.5 rounded-lg transition-colors"
                        title="Demote from admin"
                      >
                        {loadingAction === memberId ? "..." : "Demote"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePromote(memberId)}
                        disabled={loadingAction === memberId}
                        className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-1.5 rounded-lg transition-colors"
                        title="Promote to admin"
                      >
                        {loadingAction === memberId ? "..." : "Admin"}
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => handleRemove(memberId)}
                  disabled={loadingAction === memberId}
                  className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1.5 rounded-lg transition-colors"
                  title="Remove member"
                >
                  {loadingAction === memberId ? "..." : "Kick"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
