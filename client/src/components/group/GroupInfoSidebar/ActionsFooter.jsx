import React from "react";

export default function ActionsFooter({ onLeave }) {
  return (
    <div className="p-4 bg-black/20 backdrop-blur-lg border-t border-white/5 flex flex-col gap-3 shrink-0">
      <button
        onClick={onLeave}
        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-sm font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
      >
        Leave Group
      </button>
    </div>
  );
}
