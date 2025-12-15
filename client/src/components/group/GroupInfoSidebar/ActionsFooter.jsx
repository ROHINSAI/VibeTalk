import React from "react";

export default function ActionsFooter({ onLeave }) {
  return (
    <div className="p-4 bg-white/60 dark:bg-black/20 backdrop-blur-lg border-t border-gray-200 dark:border-white/5 flex flex-col gap-3 shrink-0">
      <button
        onClick={onLeave}
        className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-sm font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
      >
        Leave Group
      </button>
    </div>
  );
}
