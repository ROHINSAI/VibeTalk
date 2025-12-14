import React from "react";

export default function MemberList({
  members = [],
  group = {},
  onlineUsers = [],
}) {
  const onlineUsersList = Array.isArray(onlineUsers) ? onlineUsers : [];

  return (
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
                src={member.ProfilePic || "/avatar_icon.png"}
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
  );
}
