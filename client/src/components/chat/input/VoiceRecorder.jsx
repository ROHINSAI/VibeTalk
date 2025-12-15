import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, Send, RotateCcw, Trash2 } from "lucide-react";

export default function VoiceRecorder({
  isRecording,
  isPaused,
  previewUrl,
  isPlaying,
  recordingTime,
  canvasRef,
  audioRef,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  sendPreview,
  discardPreview,
  togglePlayback,
}) {
  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {/* Recording State */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full"
          >
             <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 rounded-full bg-red-500"
             />
            <div className="text-xs font-mono text-red-200 min-w-[35px]">
              {`${String(Math.floor(recordingTime / 60)).padStart(2, "0")}:${String(recordingTime % 60).padStart(2, "0")}`}
            </div>
            <canvas ref={canvasRef} width={120} height={30} className="rounded opacity-70" />
          </motion.div>
        )}

        {/* Controls */}
        {!previewUrl ? (
          <motion.div 
            key="recording-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            {isRecording ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => isPaused ? resumeRecording() : pauseRecording()}
                  className="p-2 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                   {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={stopRecording}
                  className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Square size={16} fill="currentColor" />
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={startRecording}
                className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-700 hover:text-white text-gray-400 transition-all"
              >
                <Mic size={20} />
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="preview-controls"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2"
          >
            <audio
              ref={audioRef}
              src={previewUrl}
              onPlay={() => {}}
              onPause={() => {}}
              onEnded={() => {}}
              className="hidden" 
            />
            {/* Custom Audio Player UI could go here, for now simple controls */}
            
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={togglePlayback}
                className="p-2 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => {
                    discardPreview();
                    setTimeout(() => startRecording(), 120);
                }}
                className="p-2 rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors"
                title="Re-record"
            >
                <RotateCcw size={16} />
            </motion.button>

             <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={discardPreview}
                className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Discard"
            >
                <Trash2 size={16} />
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={sendPreview}
                className="p-2 rounded-full bg-green-500 text-white shadow-lg shadow-green-900/20 hover:bg-green-600 transition-colors ml-1"
                title="Send Voice Message"
            >
                <Send size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
