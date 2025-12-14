import React from "react";

export default function MediaGrid({ media = [] }) {
  if (!media || media.length === 0) {
    return (
      <div className="mt-2 text-gray-400 text-center py-4">
        No media shared yet
      </div>
    );
  }

  return (
    <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
      {media.map((msg, index) => (
        <div
          key={msg._id || index}
          onClick={() => window.open(msg.image, "_blank")}
          className="cursor-pointer rounded hover:opacity-100 transition-opacity"
        >
          <img
            src={msg.image}
            alt={`Media`}
            className="w-full h-24 object-cover rounded-md"
          />
        </div>
      ))}
    </div>
  );
}
