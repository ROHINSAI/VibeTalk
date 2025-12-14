import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import toast from "react-hot-toast";

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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-gray-900 rounded-lg w-11/12 max-w-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Message options</h3>
            <button onClick={onClose} className="text-gray-300">
              ×
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleForwardClick}
              className="w-full text-left px-3 py-2 rounded bg-gray-800 text-white"
            >
              Forward message
            </button>

            <button
              onClick={handleCopy}
              className="w-full text-left px-3 py-2 rounded bg-gray-800 text-white"
            >
              Copy message
            </button>

            <button
              onClick={handleToggleStar}
              className="w-full text-left px-3 py-2 rounded bg-amber-600 text-white"
            >
              {starred ? "Remove from starred" : "Add to starred"}
            </button>

            {String(authUser?._id) === String(message.senderId) &&
              !message.image && (
                <>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="w-full text-left px-3 py-2 rounded bg-blue-600 text-white"
                    >
                      Edit message
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 text-white"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const prevText = message.text;
                            try {
                              updateMessage({
                                _id: message._id,
                                text: editText,
                                edited: true,
                              });
                            } catch (e) {
                              console.warn("optimistic update failed:", e);
                            }
                            try {
                              const res = await axios.put(
                                `/api/messages/edit/${message._id}`,
                                { text: editText }
                              );
                              const updated = res.data.msg || res.data;
                              if (updated && updated._id) {
                                updateMessage(updated);
                              }
                              toast.success("Message edited");
                              onClose();
                            } catch (err) {
                              console.error("edit failed:", err);
                              try {
                                updateMessage({
                                  _id: message._id,
                                  text: prevText,
                                });
                              } catch (rbErr) {
                                console.warn("rollback failed:", rbErr);
                              }
                              toast.error(
                                err.response?.data?.message || "Edit failed"
                              );
                            }
                          }}
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
                  )}
                </>
              )}

            <button
              onClick={handleDeleteForMe}
              className="w-full text-left px-3 py-2 rounded bg-gray-800 text-white"
            >
              Delete for me
            </button>

            {(String(authUser?._id) === String(message.senderId) ||
              String(authUser?._id) === String(message.senderId?._id)) && (
              <button
                onClick={handleDeleteForEveryone}
                className="w-full text-left px-3 py-2 rounded bg-red-600 text-white"
              >
                Delete for everyone
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
