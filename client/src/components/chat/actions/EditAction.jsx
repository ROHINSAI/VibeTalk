import React from "react";
import ActionButton from "../ui/ActionButton";
import { Pencil } from "lucide-react";

export default function EditAction({
  editing,
  setEditing,
  editText,
  setEditText,
  onSave,
}) {
  if (!editing) {
    return (
      <ActionButton
        label="Edit message"
        onClick={() => setEditing(true)}
        icon={Pencil}
        variant="primary"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 p-1">
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-transparent focus:border-blue-500 focus:outline-none resize-none transition-all"
        rows={3}
        placeholder="Edit your message..."
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
