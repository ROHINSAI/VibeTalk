import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { CallContext } from "../../../context/CallContext";
import { ChatContext } from "../../../context/ChatContext";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import assets from "../../assets/assets";

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
    <div className="fixed inset-0 z-[100] flex flex-col bg-black overflow-hidden">
      {/* Top Details Bar */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
      >
        <div className="flex items-center gap-4 pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full">
           {caller?.ProfilePic ? (
            <img
              src={caller.ProfilePic}
              alt={caller.fullName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : (
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-white/20">
              {caller?.fullName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">
                {caller?.fullName || activeCall.userName || "Unknown"}
            </h3>
             <p className="text-emerald-400 text-xs font-mono">
                {isRinging ? "Connecting..." : formatDuration(callDuration)}
             </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {callType === "video" ? (
          <>
            {/* Remote Video (Full Screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
             
            {!remoteStream && (
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping opacity-30 bg-violet-500 rounded-full" />
                            <img 
                                src={caller?.ProfilePic || assets.avatar_icon} 
                                className="w-24 h-24 rounded-full object-cover ring-4 ring-violet-500/50 relative z-10 grayscale" 
                            />
                        </div>
                        <p className="text-white/60 text-lg animate-pulse">Waiting for video...</p>
                    </div>
                 </div>
            )}

            {/* Local Video (Floating PiP) */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Simplified constraints for now, ideally calc
                whileDrag={{ scale: 1.1, cursor: "grabbing" }}
                className="absolute top-24 right-6 w-36 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-gray-800 z-20 cursor-grab active:cursor-grabbing group"
            >
               <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
               />
               
               {isVideoOff && (
                   <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <VideoOff className="text-white/30" size={32} />
                   </div>
               )}
               
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
            </motion.div>
          </>
        ) : (
          /* Voice Call UI */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-[#1a1625] to-black relative overflow-hidden">
             
             {/* Animated Background Mesh */}
             <div className="absolute inset-0 opacity-20">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/30 rounded-full blur-[120px] animate-pulse" />
             </div>

             <div className="relative z-10 flex flex-col items-center gap-8">
                 <div className="relative">
                     {/* Audio Visualizer Rings */}
                     {!isMuted && (
                         <>
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -inset-12 bg-violet-500/20 rounded-full" 
                            />
                             <motion.div 
                                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.2, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                className="absolute -inset-6 bg-violet-500/30 rounded-full" 
                            />
                         </>
                     )}
                     
                     <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-2xl">
                        <img 
                            src={caller?.ProfilePic || assets.avatar_icon} 
                            className="w-full h-full rounded-full object-cover border-4 border-gray-900" 
                        />
                     </div>
                 </div>

                 <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{caller?.fullName}</h2>
                    <p className="text-emerald-400 font-mono tracking-widest">{formatDuration(callDuration)}</p>
                 </div>
             </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-6 px-8 py-5 bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
           <motion.button
              whileHover={{ scale: 1.1, backgroundColor: isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleAudio}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
           >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
           </motion.button>
           
           {callType === "video" && (
               <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: isVideoOff ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
               >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
               </motion.button>
           )}

           <motion.button
              whileHover={{ scale: 1.1, rotate: 135 }}
              whileTap={{ scale: 0.95 }}
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/40 hover:bg-red-600 transition-colors"
           >
              <PhoneOff size={32} />
           </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
