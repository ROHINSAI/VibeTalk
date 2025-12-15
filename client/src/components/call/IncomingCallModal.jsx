import { useContext, useEffect, useState } from "react";
import { CallContext } from "../../../context/CallContext";
import { ChatContext } from "../../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, PhoneOff } from "lucide-react";

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

  return (
    <AnimatePresence>
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-md">
           {/* Background Pulse Effect */}
           <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-3xl pointer-events-none"
           />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden"
          >
             {/* Decorative Gradient */}
             <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
             
            <div className="flex flex-col items-center gap-8 relative z-10">
              <div className="relative">
                {/* Ring Animation */}
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/50 animate-ping opacity-75" />
                <div className="absolute -inset-4 rounded-full border border-violet-500/30 animate-pulse" />
                
                {caller?.ProfilePic ? (
                  <img
                    src={caller.ProfilePic}
                    alt={caller.fullName}
                    className="w-32 h-32 rounded-full object-cover shadow-2xl relative z-10 ring-4 ring-black/50"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl relative z-10 ring-4 ring-black/50">
                    {caller?.fullName?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                
                <div className="absolute bottom-0 right-0 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full z-20">
                  {incomingCall.callType === "video" ? (
                    <Video size={20} className="text-white" />
                  ) : (
                    <Phone size={20} className="text-white" />
                  )}
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {caller?.fullName || "Unknown User"}
                </h3>
                <p className="text-violet-200/80 font-medium">
                  Resulting {incomingCall.callType} Call...
                </p>
              </div>

              <div className="flex gap-6 w-full">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={rejectCall}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                    <div className="w-16 h-16 rounded-full bg-red-500/20 group-hover:bg-red-500 border border-red-500/50 flex items-center justify-center transition-all shadow-lg shadow-red-900/20">
                        <PhoneOff size={28} className="text-red-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-red-400 transition-colors">Decline</span>
                </motion.button>
                
                <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={acceptCall}
                   className="flex-1 flex flex-col items-center gap-2 group"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-500 group-hover:bg-emerald-400 flex items-center justify-center transition-all shadow-lg shadow-emerald-900/30 animate-bounce">
                         <Phone size={28} className="text-white fill-current" />
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-emerald-400 transition-colors">Accept</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
