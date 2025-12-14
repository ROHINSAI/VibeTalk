export default function ScrollButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 bg-violet-500 text-white rounded-full p-2 shadow-lg"
    >
      ↓
    </button>
  );
}
