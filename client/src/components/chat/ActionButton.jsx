import React from "react";

export default function ActionButton({
  label,
  onClick,
  className = "",
  children,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded ${className}`}
    >
      {children || label}
    </button>
  );
}
