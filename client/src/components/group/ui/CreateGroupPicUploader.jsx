export default function CreateGroupPicUploader({
  groupPic,
  setGroupPic,
  fileInputRef,
}) {
  return (
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
            "G"
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
      <p className="text-xs text-gray-400 mt-2">Group Picture (Optional)</p>
    </div>
  );
}
