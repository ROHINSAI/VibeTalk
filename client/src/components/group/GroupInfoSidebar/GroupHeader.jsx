import React from "react";

export default function GroupHeader({ group, members = [], onlineUsers = [] }) {
  const onlineUsersList = Array.isArray(onlineUsers) ? onlineUsers : [];
  const onlineMembersCount = members.filter(
    (member) =>
      Array.isArray(onlineUsersList) &&
      onlineUsersList.some(
        (u) => String(u.userId) === String(member._id || member.userId)
      )
  ).length;

  return (
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
  );
}
