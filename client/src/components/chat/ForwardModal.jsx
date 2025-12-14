import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import assets from "../../assets/assets";
import toast from "react-hot-toast";

export default function ForwardModal({ open, onClose, message }) {
  const { axios } = useContext(AuthContext);
  const { users, getUsers, groups, getGroups } = useContext(ChatContext);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    if (open) {
      getUsers();
      getGroups();
      setSelectedFriends(new Set());
      setSelectedGroups(new Set());
    }
  }, [open]);

  if (!open) return null;

  const friends = users || [];
  const groupsList = groups || [];

  const toggleFriend = (id) => {
    setSelectedFriends((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const toggleGroup = (id) => {
    setSelectedGroups((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const handleForward = async () => {
    if (selectedFriends.size === 0 && selectedGroups.size === 0) {
      toast.error("Select at least one friend or group to forward to");
      return;
    }

    const payload = {};
    if (message?.text) payload.text = message.text;
    if (message?.image) payload.image = message.image;

    const friendIds = Array.from(selectedFriends);
    const groupIds = Array.from(selectedGroups);

    try {
      const friendPromises = friendIds.map((friendId) =>
        axios.post(`/api/messages/send/${friendId}`, payload)
      );
      const groupPromises = groupIds.map((groupId) =>
        axios.post(`/api/groups/${groupId}/messages`, payload)
      );

      await Promise.all([...friendPromises, ...groupPromises]);

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

        <div className="flex gap-2 mb-3 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 ${
              activeTab === "friends"
                ? "text-violet-400 border-b-2 border-violet-400"
                : "text-gray-400"
            }`}
          >
            Friends ({selectedFriends.size})
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 ${
              activeTab === "groups"
                ? "text-violet-400 border-b-2 border-violet-400"
                : "text-gray-400"
            }`}
          >
            Groups ({selectedGroups.size})
          </button>
        </div>

        <div className="max-h-56 overflow-y-auto mb-3">
          {activeTab === "friends" ? (
            friends.length === 0 ? (
              <div className="text-gray-400">No friends to forward to</div>
            ) : (
              friends.map((f) => (
                <label
                  key={f._id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.has(f._id)}
                    onChange={() => toggleFriend(f._id)}
                    className="w-4 h-4"
                  />
                  <img
                    src={f.ProfilePic || assets.avatar_icon}
                    alt={f.fullName || "avatar"}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-white text-sm">{f.fullName}</div>
                </label>
              ))
            )
          ) : groupsList.length === 0 ? (
            <div className="text-gray-400">No groups to forward to</div>
          ) : (
            groupsList.map((g) => (
              <label
                key={g._id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.has(g._id)}
                  onChange={() => toggleGroup(g._id)}
                  className="w-4 h-4"
                />
                {g.groupPic ? (
                  <img
                    src={g.groupPic}
                    alt={g.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
                    {g.name?.[0]?.toUpperCase() || "G"}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-white text-sm">{g.name}</div>
                  <div className="text-gray-400 text-xs">
                    {g.members?.length || 0} members
                  </div>
                </div>
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
            Forward ({selectedFriends.size + selectedGroups.size})
          </button>
        </div>
      </div>
    </div>
  );
}
