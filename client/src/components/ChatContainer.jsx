import assets, { messagesDummyData } from "../assets/assets";
import { useEffect, useRef } from "react";
import { formatMessageTime } from "../lib/utils";

function ChatContainer({ selectedUser, setSelectedUser }) {
  const scrollEnd = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesDummyData.length]);

  return selectedUser ? (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center py-3 gap-3 mx-4 border-b border-stone-500">
        <img
          src={assets.profile_martin}
          className="w-8 rounded-full"
          alt="Profile Martin"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          Martin Johnson
          <span className="w-2 h-2 rounded-full bg-green-600" />
        </p>
        <img
          src={assets.arrow_icon}
          alt="Arrow Icon"
          className="md:hidden w-7"
          onClick={() => setSelectedUser(null)}
        />
        <img src={assets.help_icon} alt="help" className="max-md:hidden w-5" />
      </div>

      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto p-3 pb-4 min-h-0"
      >
        {messagesDummyData.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end justify-end gap-2${
              msg.senderId !== "680f50e4f10f3cd28382ecf9"
                ? " flex-row-reverse"
                : ""
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt="message"
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white${
                  msg.senderId === "680f50e4f10f3cd28382ecf9"
                    ? " rounded-br-none"
                    : " rounded-bl-none bg-[#4e4a7c]"
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === "680f50e4f10f3cd28382ecf9"
                    ? assets.avatar_icon
                    : assets.profile_martin
                }
                alt="avatar"
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd} />
      </div>

      <div className="flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img src={assets.send_button} alt="" className="w-7 cursor-pointer" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
      <img src={assets.logo_icon} alt="logo" className="max-w-16" />
      <p className="text-white text-lg font-medium">Chat Anytime Anywhere</p>
    </div>
  );
}

export default ChatContainer;
