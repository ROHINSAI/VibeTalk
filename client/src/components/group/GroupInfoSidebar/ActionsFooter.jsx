import React from "react";

export default function ActionsFooter({ onLeave }) {
  return (
    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 w-[calc(100%-40px)] bg-[#1a1625] pt-2">
      <button
        onClick={onLeave}
        className="w-full bg-red-600 hover:bg-red-700 text-white border-none text-sm font-light py-2 px-8 rounded-full cursor-pointer transition-all shadow-lg"
      >
        Leave Group
      </button>
    </div>
  );
}
