import { useContext, useEffect, useState } from "react";
import { CallContext } from "../../../context/CallContext";
import { ChatContext } from "../../../context/ChatContext";

export default function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useContext(CallContext);
  const { users } = useContext(ChatContext);
  const [caller, setCaller] = useState(null);

  useEffect(() => {
    if (incomingCall && users) {
      const user = users.find((u) => u._id === incomingCall.from);
      setCaller(user);
    }
  }, [incomingCall, users]);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-violet-900/90 to-purple-900/90 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-violet-500/30">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {caller?.ProfilePic ? (
              <img
                src={caller.ProfilePic}
                alt={caller.fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-violet-400/50"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-violet-400/50">
                {caller?.fullName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center animate-pulse">
              {incomingCall.callType === "video" ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              )}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {caller?.fullName || "Unknown User"}
            </h3>
            <p className="text-violet-200 text-sm">
              Incoming {incomingCall.callType} call...
            </p>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={rejectCall}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Decline
            </button>
            <button
              onClick={acceptCall}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
