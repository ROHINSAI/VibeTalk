import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

export default function ForwardModal({ open, onClose, message }) {
  const { axios } = useContext(AuthContext);
  const { users, getUsers } = useContext(ChatContext);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (open) {
      // refresh friends list
      getUsers();
      setSelected(new Set());
    }
  }, [open]);

  if (!open) return null;

  const friends = users || [];

  const toggle = (id) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const handleForward = async () => {
    if (selected.size === 0) {
      toast.error("Select at least one friend to forward to");
      return;
    }

    const payload = {};
    if (message?.text) payload.text = message.text;
    if (message?.image) payload.image = message.image;

    const ids = Array.from(selected);
    try {
      await Promise.all(
        ids.map((friendId) =>
          axios.post(`/api/messages/send/${friendId}`, payload)
        )
      );
      toast.success("Message forwarded");
      onClose();
    } catch (err) {
      console.error("Forward error:", err);
      toast.error(err.response?.data?.message || "Failed to forward");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 rounded-lg w-11/12 max-w-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Forward Message</h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mb-3 text-sm text-gray-300">
          {message?.text ? (
            <div className="p-2 bg-gray-800 rounded">{message.text}</div>
          ) : message?.image ? (
            <img
              src={message.image}
              alt="forward"
              className="max-w-full rounded"
            />
          ) : (
            <div className="text-gray-500">No content</div>
          )}
        </div>

        <div className="max-h-56 overflow-y-auto mb-3">
          {friends.length === 0 ? (
            <div className="text-gray-400">No friends to forward to</div>
          ) : (
            friends.map((f) => (
              <label
                key={f._id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(f._id)}
                  onChange={() => toggle(f._id)}
                  className="w-4 h-4"
                />
                <img
                  src={f.ProfilePic}
                  alt={f.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-white text-sm">{f.fullName}</div>
                <div className="text-gray-400 text-xs">{f.userId}</div>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            className="px-3 py-1 rounded bg-violet-500 text-white"
          >
            Forward ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}
