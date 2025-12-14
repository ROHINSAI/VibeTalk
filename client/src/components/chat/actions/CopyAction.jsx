import React from "react";
import ActionButton from "../ui/ActionButton";

export default function CopyAction({ onCopy }) {
  return (
    <ActionButton
      label="Copy message"
      onClick={onCopy}
      className="bg-gray-800 text-white"
    />
  );
}
