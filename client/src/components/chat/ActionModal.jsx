import React from "react";

export default function ActionModal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 rounded-lg w-11/12 max-w-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">{title || "Options"}</h3>
          <button onClick={onClose} className="text-gray-300">
            ×
          </button>
        </div>
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}
