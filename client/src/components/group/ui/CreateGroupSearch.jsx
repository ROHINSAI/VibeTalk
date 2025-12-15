import assets from "../../../assets/assets";

export default function CreateGroupSearch({ searchQuery, setSearchQuery }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1625] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
        <img alt="Search" src={assets.search_icon} className="w-3 opacity-60 dark:opacity-100" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-400 flex-1"
          placeholder="Search friends..."
        />
      </div>
    </div>
  );
}
