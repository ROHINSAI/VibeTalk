import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import assets from "../../assets/assets";
import toast from "react-hot-toast";
import ForwardTabs from "./ForwardTabs";
import ForwardList from "./ForwardList";

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

        <ForwardTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          friendCount={friends.length}
          groupCount={groupsList.length}
        />

        <div className="max-h-56 overflow-y-auto mb-3">
          {activeTab === "friends" ? (
            <ForwardList
              items={friends}
              type="friend"
              selectedSet={selectedFriends}
              toggle={toggleFriend}
            />
          ) : (
            <ForwardList
              items={groupsList}
              type="group"
              selectedSet={selectedGroups}
              toggle={toggleGroup}
            />
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
