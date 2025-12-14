import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function EditGroupModal({
  open,
  onClose,
  group,
  axios,
  onUpdate,
}) {
  const [groupName, setGroupName] = useState(group?.name || "");
  const [groupDescription, setGroupDescription] = useState(
    group?.description || ""
  );
  const [groupPic, setGroupPic] = useState(group?.groupPic || "");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleUpdate = async () => {
    if (!groupName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/groups/${group._id}/update`, {
        name: groupName.trim(),
        description: groupDescription.trim(),
        groupPic: groupPic,
      });
      toast.success("Group details updated");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Update group error:", error);
      toast.error(error.response?.data?.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#282142] border border-gray-600 rounded-xl p-6 w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Edit Group</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-4">
          {/* Group Picture */}
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
                    if (fileInputRef.current) fileInputRef.current.value = "";
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
          </div>

          {/* Group Name */}
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

          {/* Description */}
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
            onClick={handleUpdate}
            disabled={loading || !groupName.trim()}
            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
