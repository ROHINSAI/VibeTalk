import CreateGroupPicUploader from "../ui/CreateGroupPicUploader";

export default function CreateGroupDetails({
  groupName,
  setGroupName,
  groupDescription,
  setGroupDescription,
  groupPic,
  setGroupPic,
  fileInputRef,
  users,
  selectedMembers,
  toggleMember,
}) {
  return (
    <div className="space-y-4 mb-4">
      <CreateGroupPicUploader
        groupPic={groupPic}
        setGroupPic={setGroupPic}
        fileInputRef={fileInputRef}
      />

      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2 font-medium">Group Name *</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="w-full bg-gray-50 dark:bg-[#1a1625] border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-[#1a1625] transition-all"
          maxLength={50}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2 font-medium">
          Description (optional)
        </label>
        <textarea
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          placeholder="Enter group description"
          className="w-full bg-gray-50 dark:bg-[#1a1625] border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-[#1a1625] transition-all resize-none"
          rows={3}
          maxLength={200}
        />
      </div>

      <div className="bg-gray-50 dark:bg-[#1a1625] border border-gray-200 dark:border-gray-600 rounded-lg p-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected Members:</p>
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((memberId) => {
            const member = users.find((u) => u._id === memberId);
            return (
              <div
                key={memberId}
                className="flex items-center gap-2 bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/50 rounded-full px-3 py-1"
              >
                <span className="text-xs text-violet-800 dark:text-white">{member?.fullName}</span>
                <button
                  onClick={() => toggleMember(memberId)}
                  className="text-violet-600 dark:text-gray-300 hover:text-violet-800 dark:hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
