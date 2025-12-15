import React from "react";
import ActionButton from "../ui/ActionButton";
import { Star } from "lucide-react";

export default function StarAction({ starred, onToggle }) {
  return (
    <ActionButton
      label={starred ? "Remove from starred" : "Add to starred"}
      onClick={onToggle}
      icon={Star}
      variant="warning"
    />
  );
}
