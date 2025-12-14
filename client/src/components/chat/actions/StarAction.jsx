import React from "react";
import ActionButton from "../ui/ActionButton";

export default function StarAction({ starred, onToggle }) {
  return (
    <ActionButton
      label={starred ? "Remove from starred" : "Add to starred"}
      onClick={onToggle}
      className="bg-amber-600 text-white"
    />
  );
}
