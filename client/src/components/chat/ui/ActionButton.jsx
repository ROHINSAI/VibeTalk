import React from "react";

const variants = {
  default: {
    bg: "bg-gray-100 dark:bg-gray-800/50",
    text: "text-gray-600 dark:text-gray-300", 
    hover: "hover:bg-gray-100 dark:hover:bg-white/5",
  },
  primary: {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    hover: "hover:bg-gray-100 dark:hover:bg-white/5",
  },
  purple: {
      bg: "bg-purple-100 dark:bg-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-gray-100 dark:hover:bg-white/5",
  },
  danger: {
    bg: "bg-red-100 dark:bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
    hover: "hover:bg-red-50 dark:hover:bg-red-900/10",
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    hover: "hover:bg-gray-100 dark:hover:bg-white/5",
  }
};

export default function ActionButton({
  label,
  onClick,
  icon: Icon,
  variant = "default",
  className = "",
  children
}) {
  const v = variants[variant] || variants.default;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors w-full mb-1 text-left ${v.hover} ${className}`}
    >
      {Icon && (
        <div className={`p-2 rounded-lg ${v.bg} ${v.text} flex items-center justify-center`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
      <span className="font-medium text-gray-700 dark:text-gray-200 flex-1">{children || label}</span>
    </button>
  );
}
