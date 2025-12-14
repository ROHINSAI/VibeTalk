import React from "react";
import ActionButton from "../ui/ActionButton";

export default function ForwardAction({ onForward, message }) {
  return (
    <ActionButton
      label="Forward message"
      onClick={() => onForward && onForward(message)}
      className="bg-gray-800 text-white"
    />
  );
}
