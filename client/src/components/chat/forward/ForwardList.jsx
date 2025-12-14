import React from "react";
import assets from "../../../assets/assets";

export default function ForwardList({
  items = [],
  type = "friend",
  selectedSet,
  toggle,
}) {
  if (!items || items.length === 0) {
    return (
      <div className="text-gray-400">
        No {type === "friend" ? "friends" : "groups"} to forward to
      </div>
    );
  }

  return (
    <div>
      {items.map((it) => (
        <label
          key={it._id}
          className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedSet.has(it._id)}
            onChange={() => toggle(it._id)}
            className="w-4 h-4"
          />
          {type === "friend" ? (
            <>
              <img
                src={it.ProfilePic || assets.avatar_icon}
                alt={it.fullName || "avatar"}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-white text-sm">{it.fullName}</div>
            </>
          ) : (
            <>
              {it.groupPic ? (
                <img
                  src={it.groupPic}
                  alt={it.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  {it.name?.[0]?.toUpperCase() || "G"}
                </div>
              )}
              <div className="flex-1">
                <div className="text-white text-sm">{it.name}</div>
                <div className="text-gray-400 text-xs">
                  {it.members?.length || 0} members
                </div>
              </div>
            </>
          )}
        </label>
      ))}
    </div>
  );
}
