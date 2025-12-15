import assets from "../../../assets/assets";

export default function TextComposer({
  text,
  setText,
  fileInputRef,
  handleImageChange,
  isRecording,
}) {
  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isRecording}
        placeholder="Send a message"
        className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent"
      />
      <input
        ref={fileInputRef}
        type="file"
        id="image"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleImageChange}
        hidden
      />
      <label
        htmlFor="image"
        className={`${isRecording ? "pointer-events-none opacity-40" : ""}`}
      >
        <img
          src={assets.gallery_icon}
          alt="Upload"
          className="w-5 mr-2 cursor-pointer invert dark:invert-0"
        />
      </label>
    </>
  );
}
