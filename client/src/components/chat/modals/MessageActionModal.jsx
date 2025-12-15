import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { ChatContext } from "../../../../context/ChatContext";
import toast from "react-hot-toast";
import ActionModal from "../ui/ActionModal";
import ActionButton from "../ui/ActionButton";
import { Reply } from "lucide-react";
import ForwardAction from "../actions/ForwardAction";
import CopyAction from "../actions/CopyAction";
import StarAction from "../actions/StarAction";
import EditAction from "../actions/EditAction";
import DeleteActions from "../actions/DeleteActions";

export default function MessageActionModal({
  open,
  onClose,
  message,
  onForward,
}) {
  const { axios, authUser } = useContext(AuthContext);
  const {
    removeMessage,
    addStarLocal,
    removeStarLocal,
    updateMessage,
    selectedGroup,
    setReplyMessage,
  } = useContext(ChatContext);
  const [starred, setStarred] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!open || !message) return;
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/messages/star/${message._id}`);
        if (!mounted) return;
        setStarred(!!res.data?.starred);
      } catch (err) {
        console.error("isStarred check failed:", err);
        if (mounted) setStarred(false);
      }
    })();
    setEditing(false);
    setEditText(message?.text || "");
    return () => (mounted = false);
  }, [open, message]);

  if (!open || !message) return null;

  const handleDeleteForMe = async () => {
    try {
      const endpoint = selectedGroup
        ? `/api/groups/${selectedGroup._id}/messages/${message._id}/delete/me`
        : `/api/messages/delete/me/${message._id}`;
      await axios.delete(endpoint);
      removeMessage(message._id);
      toast.success("Deleted for you");
      onClose();
    } catch (err) {
      console.error("deleteForMe error:", err);
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleDeleteForEveryone = async () => {
    if (
      String(authUser?._id) !== String(message.senderId) &&
      String(authUser?._id) !== String(message.senderId?._id)
    ) {
      toast.error("Only the sender can delete for everyone");
      return;
    }
    try {
      const endpoint = selectedGroup
        ? `/api/groups/${selectedGroup._id}/messages/${message._id}/delete/everyone`
        : `/api/messages/delete/everyone/${message._id}`;
      await axios.delete(endpoint);
      removeMessage(message._id);
      toast.success("Deleted for everyone");
      onClose();
    } catch (err) {
      console.error("deleteForEveryone error:", err);
      toast.error(
        err.response?.data?.message || "Failed to delete for everyone"
      );
    }
  };

  const handleForwardClick = () => {
    onClose();
    if (onForward) onForward(message);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = message.text || message.image || "";
      if (!textToCopy) {
        toast.error("Nothing to copy");
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const el = document.createElement("textarea");
        el.value = textToCopy;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      toast.success("Copied to clipboard");
      onClose();
    } catch (err) {
      console.error("copy failed:", err);
      toast.error("Copy failed");
    }
  };

  const handleToggleStar = async () => {
    try {
      if (starred) {
        await axios.delete(`/api/messages/star/${message._id}`);
        setStarred(false);
        removeStarLocal(message._id);
        toast.success("Removed from starred");
      } else {
        await axios.post(`/api/messages/star/${message._id}`);
        setStarred(true);
        addStarLocal(message._id);
        toast.success("Added to starred");
      }
      onClose();
    } catch (err) {
      console.error("star toggle error:", err);
      toast.error(err.response?.data?.message || "Failed to update star");
    }
  };

  const handleSaveEdit = async () => {
    const prevText = message.text;
    try {
      updateMessage({ _id: message._id, text: editText, edited: true });
    } catch (e) {
      console.warn("optimistic update failed:", e);
    }
    try {
      const res = await axios.put(`/api/messages/edit/${message._id}`, {
        text: editText,
      });
      const updated = res.data.msg || res.data;
      if (updated && updated._id) updateMessage(updated);
      toast.success("Message edited");
      onClose();
    } catch (err) {
      console.error("edit failed:", err);
      try {
        updateMessage({ _id: message._id, text: prevText });
      } catch (rbErr) {
        console.warn("rollback failed:", rbErr);
      }
      toast.error(err.response?.data?.message || "Edit failed");
    }
  };

  return (
    <ActionModal open={open} onClose={onClose} title="Message options">
        <ActionButton
            label="Reply"
            onClick={() => {
                setReplyMessage(message);
                onClose();
            }}
            icon={Reply}
            variant="purple"
        />
      <ForwardAction onForward={handleForwardClick} message={message} />
      <CopyAction onCopy={handleCopy} />
      <StarAction starred={starred} onToggle={handleToggleStar} />

      {String(authUser?._id) === String(message.senderId) && !message.image && (
        <EditAction
          editing={editing}
          setEditing={setEditing}
          editText={editText}
          setEditText={setEditText}
          onSave={handleSaveEdit}
        />
      )}

      <DeleteActions
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
        canDeleteEveryone={
          String(authUser?._id) === String(message.senderId) ||
          String(authUser?._id) === String(message.senderId?._id)
        }
      />
    </ActionModal>
  );
}
