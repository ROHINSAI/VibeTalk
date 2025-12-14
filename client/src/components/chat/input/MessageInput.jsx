import assets from "../../../assets/assets";

export default function MessageInput({
  text,
  setText,
  imagePreview,
  handleImageChange,
  handleSendMessage,
  fileInputRef,
}) {
  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-3 p-3">
      <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message"
          className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
        />
        <input
          ref={fileInputRef}
          type="file"
          id="image"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleImageChange}
          hidden
        />
        <label htmlFor="image">
          <img
            src={assets.gallery_icon}
            alt="Upload"
            className="w-5 mr-2 cursor-pointer"
          />
        </label>
      </div>
      <button type="submit">
        <img
          src={assets.send_button}
          alt="Send"
          className="w-7 cursor-pointer"
        />
      </button>
    </form>
  );
}
