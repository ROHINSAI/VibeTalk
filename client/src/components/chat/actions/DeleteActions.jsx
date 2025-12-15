import React from "react";
import ActionButton from "../ui/ActionButton";
import { Trash2 } from "lucide-react";

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
        icon={Trash2}
        variant="default"
      />
      {canDeleteEveryone && (
        <ActionButton
          label="Delete for everyone"
          onClick={onDeleteForEveryone}
          icon={Trash2}
          variant="danger"
        />
      )}
    </>
  );
}
