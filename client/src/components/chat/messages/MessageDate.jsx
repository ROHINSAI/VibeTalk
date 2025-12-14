export default function MessageDate({ dateString }) {
  return (
    <div className="w-full flex items-center my-4">
      <div className="flex-1 h-px bg-gray-700/50" />
      <div className="px-3 text-sm text-gray-300">{dateString}</div>
      <div className="flex-1 h-px bg-gray-700/50" />
    </div>
  );
}
