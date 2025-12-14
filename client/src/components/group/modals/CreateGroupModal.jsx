import { useContext, useState, useRef } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { ChatContext } from "../../../../context/ChatContext";
import assets from "../../../assets/assets";
import toast from "react-hot-toast";
import CreateGroupSearch from "../ui/CreateGroupSearch";
import CreateGroupMemberList from "../members/CreateGroupMemberList";
import CreateGroupDetails from "../create/CreateGroupDetails";

export default function CreateGroupModal({ open, onClose }) {
  const { axios, authUser } = useContext(AuthContext);
  const { users } = useContext(ChatContext);
  const [step, setStep] = useState(1);
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
            <CreateGroupSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <div className="mb-4 text-sm text-gray-400">
              Selected: {selectedMembers.length} friend
              {selectedMembers.length !== 1 ? "s" : ""}
            </div>

            <CreateGroupMemberList
              users={users}
              filteredUsers={filteredUsers}
              selectedMembers={selectedMembers}
              toggleMember={toggleMember}
            />

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
            <CreateGroupDetails
              groupName={groupName}
              setGroupName={setGroupName}
              groupDescription={groupDescription}
              setGroupDescription={setGroupDescription}
              groupPic={groupPic}
              setGroupPic={setGroupPic}
              fileInputRef={fileInputRef}
              users={users}
              selectedMembers={selectedMembers}
              toggleMember={toggleMember}
            />

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
