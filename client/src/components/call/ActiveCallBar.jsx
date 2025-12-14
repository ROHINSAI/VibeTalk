import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { CallContext } from "../../../context/CallContext";
import { ChatContext } from "../../../context/ChatContext";

export default function ActiveCallBar() {
  const {
    activeCall,
    callType,
    isRinging,
    localStream,
    remoteStream,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useContext(CallContext);
  const { users } = useContext(ChatContext);

  const [caller, setCaller] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (activeCall && users)
      setCaller(
        users.find((u) => String(u._id) === String(activeCall.userId)) || null
      );
  }, [activeCall, users]);

  useEffect(() => {
    if (localStream && localVideoRef.current)
      localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (!activeCall || isRinging) return;
    const t = setInterval(() => setCallDuration((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [activeCall, isRinging]);

  const formatDuration = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  const onToggleAudio = () => {
    const enabled = toggleAudio();
    setIsMuted(!enabled);
  };

  const onToggleVideo = () => {
    const enabled = toggleVideo();
    setIsVideoOff(!enabled);
  };

  if (!activeCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-gray-900 via-violet-900/50 to-purple-900/50">
      <div className="bg-black/30 backdrop-blur-sm p-4 flex items-center gap-3">
        {caller?.ProfilePic ? (
          <img
            src={caller.ProfilePic}
            alt={caller.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
            {caller?.fullName?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <div>
          <h3 className="text-white font-semibold">
            {caller?.fullName || activeCall.userName || "User"}
          </h3>
          <p className="text-violet-300 text-sm">
            {isRinging ? "Ringing..." : formatDuration(callDuration)}
          </p>
        </div>
      </div>

      {callType === "video" ? (
        <div className="flex-1 relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-gray-900"
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                {caller?.ProfilePic ? (
                  <img
                    src={caller.ProfilePic}
                    alt={caller.fullName}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 ring-4 ring-violet-500/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-violet-600 flex items-center justify-center text-white text-5xl font-bold mx-auto mb-4 ring-4 ring-violet-500/30">
                    {caller?.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <p className="text-white text-lg">
                  {isRinging ? "Calling..." : "Connecting..."}
                </p>
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4 w-32 h-40 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-gray-800"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white/50"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-violet-900 to-purple-900">
          <div className="text-center">
            {caller?.ProfilePic ? (
              <img
                src={caller.ProfilePic}
                alt={caller.fullName}
                className="w-40 h-40 rounded-full object-cover mx-auto mb-6 ring-8 ring-violet-500/30 shadow-2xl"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-violet-600 flex items-center justify-center text-white text-6xl font-bold mx-auto mb-6 ring-8 ring-violet-500/30 shadow-2xl">
                {caller?.fullName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <h2 className="text-white text-3xl font-bold mb-2">
              {caller?.fullName || activeCall.userName || "User"}
            </h2>
            <p className="text-violet-200 text-xl">
              {isRinging ? "Calling..." : formatDuration(callDuration)}
            </p>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center z-60 pointer-events-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 bg-black/70 backdrop-blur-md rounded-3xl flex items-center justify-center gap-6 shadow-2xl border border-white/10">
          <button
            onClick={onToggleAudio}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform transform hover:scale-110 active:scale-95 shadow-xl ring-2 ring-white/8 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {isMuted ? (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {callType === "video" && (
            <button
              onClick={onToggleVideo}
              aria-label={isVideoOff ? "Enable video" : "Disable video"}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform transform hover:scale-110 active:scale-95 shadow-xl ring-2 ring-white/8 ${
                isVideoOff
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              {isVideoOff ? (
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              )}
            </button>
          )}

          <button
            onClick={endCall}
            aria-label="End call"
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-transform transform hover:scale-110 active:scale-95 shadow-2xl ring-4 ring-red-700/30"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
