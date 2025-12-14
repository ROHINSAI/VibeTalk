export default function ImagePreview({ imagePreview, removeImage }) {
  if (!imagePreview) return null;
  return (
    <div className="p-3">
      <div className="max-w-xs">
        <img src={imagePreview} alt="preview" className="rounded-lg" />
        <button onClick={removeImage} className="text-sm text-red-400 mt-2">
          Remove
        </button>
      </div>
    </div>
  );
}
