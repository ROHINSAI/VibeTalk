import React from "react";

export default function ForwardTabs({
  activeTab,
  setActiveTab,
  friendCount,
  groupCount,
}) {
  return (
    <div className="flex gap-2 mb-3 border-b border-gray-700">
      <button
        onClick={() => setActiveTab("friends")}
        className={`px-4 py-2 ${
          activeTab === "friends"
            ? "text-violet-400 border-b-2 border-violet-400"
            : "text-gray-400"
        }`}
      >
        Friends ({friendCount})
      </button>
      <button
        onClick={() => setActiveTab("groups")}
        className={`px-4 py-2 ${
          activeTab === "groups"
            ? "text-violet-400 border-b-2 border-violet-400"
            : "text-gray-400"
        }`}
      >
        Groups ({groupCount})
      </button>
    </div>
  );
}
