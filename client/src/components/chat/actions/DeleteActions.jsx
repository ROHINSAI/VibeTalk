import React from "react";
import ActionButton from "../ui/ActionButton";

export default function DeleteActions({
  onDeleteForMe,
  onDeleteForEveryone,
  canDeleteEveryone,
}) {
  return (
    <>
      <ActionButton
        label="Delete for me"
        onClick={onDeleteForMe}
        className="bg-gray-800 text-white"
      />
      {canDeleteEveryone && (
        <ActionButton
          label="Delete for everyone"
          onClick={onDeleteForEveryone}
          className="bg-red-600 text-white"
        />
      )}
    </>
  );
}
