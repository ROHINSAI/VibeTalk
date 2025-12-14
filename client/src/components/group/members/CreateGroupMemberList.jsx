import CreateGroupMemberItem from "./CreateGroupMemberItem";

export default function CreateGroupMemberList({
  users,
  filteredUsers,
  selectedMembers,
  toggleMember,
}) {
  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => {
          const isSelected = selectedMembers.includes(user._id);
          return (
            <CreateGroupMemberItem
              key={user._id}
              user={user}
              isSelected={isSelected}
              onToggle={toggleMember}
            />
          );
        })
      ) : (
        <p className="text-center text-gray-400 py-8">No friends found</p>
      )}
    </div>
  );
}
