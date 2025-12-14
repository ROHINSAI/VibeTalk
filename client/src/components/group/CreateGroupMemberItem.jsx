import assets from "../../assets/assets";

export default function CreateGroupMemberItem({ user, isSelected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(user._id)}
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
        <p className="text-white font-medium">{user.fullName}</p>
        <p className="text-xs text-gray-400">ID: {user.userId}</p>
      </div>
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          isSelected ? "bg-violet-600 border-violet-600" : "border-gray-500"
        }`}
      >
        {isSelected && <span className="text-white text-xs">✓</span>}
      </div>
    </div>
  );
}
