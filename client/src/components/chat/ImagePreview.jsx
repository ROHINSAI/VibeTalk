export default function ImagePreview({ imagePreview, removeImage }) {
  if (!imagePreview) return null;
  return (
    <div className="mx-3 mb-2 relative">
      <img
        src={imagePreview}
        alt="Preview"
        className="max-w-[150px] rounded-lg border border-gray-600"
      />
      <button
        onClick={removeImage}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
}
