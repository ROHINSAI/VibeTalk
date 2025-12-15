import { useContext, useState } from "react";
import { ChatContext } from "../../../../context/ChatContext";
import toast from "react-hot-toast";

export default function AddMembersModal({
  open,
  onClose,
  group,
  axios,
  onUpdate,
}) {
  const { users } = useContext(ChatContext);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const currentMemberIds = (group?.members || []).map((m) =>
    String(m._id || m)
  );
  const availableUsers = users.filter(
    (user) => !currentMemberIds.includes(String(user._id))
  );

  const filteredUsers = availableUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAdd = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`/api/groups/${group._id}/add-members`, {
        memberIds: selectedMembers,
      });
      toast.success(res.data.message || "Invitations sent");
      setSelectedMembers([]);
      setSearchQuery("");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Add members error:", error);
      toast.error(error.response?.data?.message || "Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#282142] border border-gray-200 dark:border-gray-600 rounded-xl p-6 w-[90%] max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Members</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1625] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-400 flex-1"
              placeholder="Search friends..."
            />
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-400">
          Selected: {selectedMembers.length} friend
          {selectedMembers.length !== 1 ? "s" : ""}
        </div>

        {/* Member List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isSelected = selectedMembers.includes(user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => toggleMember(user._id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-violet-100 dark:bg-violet-600/30 border border-violet-200 dark:border-violet-500"
                      : "bg-gray-50 dark:bg-[#1a1625] border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#252035]"
                  }`}
                >
                  <img
                    src={user.ProfilePic || "/avatar_icon.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {user.userId}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? "bg-violet-600 border-violet-600"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-400 py-8">
              {availableUsers.length === 0
                ? "All friends are already members"
                : "No friends found"}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={loading || selectedMembers.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
          >
            {loading ? "Sending..." : "Send Invites"}
          </button>
        </div>
      </div>
    </div>
  );
}
