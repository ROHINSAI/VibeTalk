export default function ScrollButton({ onClick }) {
  return (
    <div className="absolute right-6 bottom-24">
      <button
        onClick={onClick}
        className="bg-violet-500/80 text-white px-3 py-1 rounded-full shadow-lg"
      >
        ↓ New
      </button>
    </div>
  );
}
