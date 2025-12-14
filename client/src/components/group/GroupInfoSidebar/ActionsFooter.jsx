import React from "react";

export default function ActionsFooter({ onLeave }) {
  return (
    <div className="w-full p-5 bg-[#1a1625] border-t border-[#ffffff10]">
      <button
        onClick={onLeave}
        className="w-full bg-red-600 hover:bg-red-700 text-white border-none text-sm font-light py-2 px-8 rounded-full cursor-pointer transition-all shadow-lg"
      >
        Leave Group
      </button>
    </div>
  );
}
