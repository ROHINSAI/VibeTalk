import { useContext, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import assets from "../assets/assets";
import toast from "react-hot-toast";

export default function CreateGroupModal({ open, onClose }) {
  const { axios, authUser } = useContext(AuthContext);
  const { users } = useContext(ChatContext);
  const [step, setStep] = useState(1); // 1: select members, 2: group details
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupPic, setGroupPic] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleClose = () => {
    setStep(1);
    setSelectedMembers([]);
    setSearchQuery("");
    setGroupName("");
    setGroupDescription("");
    setGroupPic("");
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleNext = () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one friend");
      return;
    }
    setStep(2);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/groups/create", {
        name: groupName.trim(),
        description: groupDescription.trim(),
        memberIds: selectedMembers,
        groupPic: groupPic,
      });

      toast.success(`Group created! ${res.data.requestsSent} invitations sent`);
      handleClose();
    } catch (error) {
      console.error("Create group error:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#282142] border border-gray-600 rounded-xl p-6 w-[90%] max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {step === 1 ? "Select Members" : "Group Details"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {step === 1 ? (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-[#1a1625] border border-gray-600 rounded-lg px-3 py-2">
                <img alt="Search" src={assets.search_icon} className="w-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 flex-1"
                  placeholder="Search friends..."
                />
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-400">
              Selected: {selectedMembers.length} friend
              {selectedMembers.length !== 1 ? "s" : ""}
            </div>

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
                          ? "bg-violet-600/30 border border-violet-500"
                          : "bg-[#1a1625] border border-gray-600 hover:bg-[#252035]"
                      }`}
                    >
                      <img
                        src={user.ProfilePic || assets.avatar_icon}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {user.userId}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-violet-600 border-violet-600"
                            : "border-gray-500"
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
                  No friends found
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={selectedMembers.length === 0}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {/* Group Profile Picture */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-3xl overflow-hidden border-2 border-gray-600">
                    {groupPic ? (
                      <img
                        src={groupPic}
                        alt="Group"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      groupName.charAt(0).toUpperCase() || "G"
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-700 text-white rounded-full p-2 border-2 border-[#282142]"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  {groupPic && (
                    <button
                      type="button"
                      onClick={() => {
                        setGroupPic("");
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 border-2 border-[#282142]"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setGroupPic(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Group Picture (Optional)
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full bg-[#1a1625] border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Enter group description"
                  className="w-full bg-[#1a1625] border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500 resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="bg-[#1a1625] border border-gray-600 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-2">Selected Members:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((memberId) => {
                    const member = users.find((u) => u._id === memberId);
                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-2 bg-violet-600/20 border border-violet-500/50 rounded-full px-3 py-1"
                      >
                        <span className="text-xs text-white">
                          {member?.fullName}
                        </span>
                        <button
                          onClick={() => toggleMember(memberId)}
                          className="text-gray-300 hover:text-white"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={loading || !groupName.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
