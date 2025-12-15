import React from "react";
import ActionButton from "../ui/ActionButton";
import { Copy } from "lucide-react";

export default function CopyAction({ onCopy }) {
  return (
    <ActionButton
      label="Copy message"
      onClick={onCopy}
      icon={Copy}
      variant="default"
    />
  );
}
