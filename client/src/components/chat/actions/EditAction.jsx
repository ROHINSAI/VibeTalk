import React from "react";
import ActionButton from "../ActionButton";

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
        className="bg-blue-600 text-white"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-white"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex-1 px-3 py-2 rounded bg-green-600 text-white"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
