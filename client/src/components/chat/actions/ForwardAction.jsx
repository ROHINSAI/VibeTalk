import React from "react";
import ActionButton from "../ui/ActionButton";
import { Forward } from "lucide-react";

export default function ForwardAction({ onForward, message }) {
  if (message.audio) return null; // Can't forward audio yet? (Preserving logic, though not explicit in old code, usually prudent)
  
  return (
    <ActionButton
      label="Forward message"
      onClick={onForward}
      icon={Forward}
      variant="default"
    />
  );
}
