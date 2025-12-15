import React from "react";
import { motion } from "framer-motion";

export default function GroupHeader({ group, members = [], onlineUsers = [], onClose }) {
  const onlineUsersList = Array.isArray(onlineUsers) ? onlineUsers : [];
  const onlineMembersCount = members.filter(
    (member) =>
      Array.isArray(onlineUsersList) &&
      onlineUsersList.some(
        (u) => String(u) === String(member._id || member.userId)
      )
  ).length;

  return (
    <div className="pt-10 pb-4 flex flex-col items-center gap-3 text-xs font-light mx-auto relative z-10 w-full">
      {/* Back Button for Mobile */}
      <button 
        onClick={onClose}
        className="md:hidden absolute left-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 dark:text-gray-400 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {group.groupPic ? (
          <img
            src={group.groupPic}
            alt={group.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
            <span className="text-white text-4xl font-bold">
              {group.name?.[0]?.toUpperCase() || "G"}
            </span>
          </div>
        )}
      </motion.div>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-wide px-6 text-gray-900 dark:text-white">
          {group.name}
        </h1>
        {group.description && (
          <p className="text-gray-600 dark:text-gray-400 text-xs max-w-[200px] mx-auto leading-relaxed px-4 line-clamp-2">
            {group.description}
          </p>
        )}
      </div>

      <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 mt-2 flex gap-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Members</p>
          <p className="text-lg font-bold tracking-wider text-violet-600 dark:text-violet-400">
            {members.length}
          </p>
        </div>
        <div className="text-center border-l border-gray-300 dark:border-white/10 pl-6">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Online</p>
          <p className="text-lg font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
            {onlineMembersCount}
          </p>
        </div>
      </div>
    </div>
  );
}
