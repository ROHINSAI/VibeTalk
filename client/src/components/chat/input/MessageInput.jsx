import assets from "../../../assets/assets";
import { useRef, useState, useEffect, useContext } from "react";
import { ChatContext } from "../../../../context/ChatContext.jsx";
import { AuthContext } from "../../../../context/AuthContext.jsx";
import TextComposer from "./TextComposer";
import VoiceRecorder from "./VoiceRecorder";
import SendButton from "./SendButton";

export default function MessageInput({
  text,
  setText,
  imagePreview,
  handleImageChange,
  handleSendMessage,
  handleSendVoice,
  fileInputRef,
}) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordedChunksRef = useRef([]);
  const audioRef = useRef(null);
  const recordedBlobRef = useRef(null);
  const waveformBlobRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      streamRef.current = stream;
      setPreviewUrl(null);
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        // store blob for sending
        recordedBlobRef.current = blob;
        // create object URL for playback preview
        try {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        } catch (e) {
          // fallback to dataURL if createObjectURL fails
          const reader = new FileReader();
          reader.onloadend = async () => setPreviewUrl(reader.result);
          reader.readAsDataURL(blob);
        }
        // capture waveform image from canvas if available
        if (canvasRef.current && canvasRef.current.toBlob) {
          canvasRef.current.toBlob((wfBlob) => {
            waveformBlobRef.current = wfBlob;
          }, "image/png");
        }
        // stop all tracks
        try {
          streamRef.current?.getTracks()?.forEach((t) => t.stop());
        } catch (e) {
          /* ignore */
        }
        streamRef.current = null;
        setIsRecording(false);
        setIsPaused(false);
        // stop visualizer and audio context
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        try {
          if (
            audioCtxRef.current &&
            typeof audioCtxRef.current.close === "function"
          ) {
            await audioCtxRef.current.close();
          }
        } catch (e) {
          /* ignore */
        }
        audioCtxRef.current = null;
        analyserRef.current = null;
        dataArrayRef.current = null;
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setRecordingTime(0);
      };
      mr.start();
      setIsRecording(true);
      // start audio visualizer
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        const source = audioCtxRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        source.connect(analyserRef.current);
        dataArrayRef.current = new Uint8Array(analyserRef.current.fftSize);

        const canvas = canvasRef.current;
        const canvasCtx = canvas?.getContext("2d");
        const draw = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
          if (canvasCtx && canvas) {
            const width = canvas.width;
            const height = canvas.height;
            canvasCtx.clearRect(0, 0, width, height);
            canvasCtx.fillStyle = "rgba(0,0,0,0)";
            canvasCtx.fillRect(0, 0, width, height);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = "#9b5cff";
            canvasCtx.beginPath();
            const sliceWidth = (width * 1.0) / dataArrayRef.current.length;
            let x = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) {
              const v = dataArrayRef.current[i] / 128.0;
              const y = (v * height) / 2;
              if (i === 0) canvasCtx.moveTo(x, y);
              else canvasCtx.lineTo(x, y);
              x += sliceWidth;
            }
            canvasCtx.lineTo(width, height / 2);
            canvasCtx.stroke();
          }
          animationRef.current = requestAnimationFrame(draw);
        };
        draw();
      } catch (e) {
        console.warn("Visualizer setup failed:", e);
      }

      // start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const pauseRecording = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
      // suspend visualizer audio context
      try {
        audioCtxRef.current?.suspend();
      } catch (e) {
        /* ignore */
      }
    } catch (e) {
      console.error("pause failed", e);
    }
  };

  const resumeRecording = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "paused"
      ) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      }
      // resume visualizer audio context
      try {
        audioCtxRef.current?.resume();
      } catch (e) {
        /* ignore */
      }
    } catch (e) {
      console.error("resume failed", e);
    }
  };

  const sendPreview = async () => {
    if (!recordedBlobRef.current) return;
    try {
      if (handleSendVoice) {
        // disable UI handled by hook/context (toast)
        await handleSendVoice({
          audioBlob: recordedBlobRef.current,
          waveformBlob: waveformBlobRef.current,
        });
      }
      // cleanup preview and recorded blob
      try {
        if (previewUrl && previewUrl.startsWith("blob:"))
          URL.revokeObjectURL(previewUrl);
      } catch (e) {}
      setPreviewUrl(null);
      recordedChunksRef.current = [];
      recordedBlobRef.current = null;
      waveformBlobRef.current = null;
    } catch (err) {
      console.error("Failed to send voice message:", err);
    }
  };

  const discardPreview = () => {
    try {
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
    } catch (e) {}
    setPreviewUrl(null);
    recordedChunksRef.current = [];
    recordedBlobRef.current = null;
    waveformBlobRef.current = null;
    // ensure audio element stopped
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (e) {}
  };

  const togglePlayback = () => {
    try {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const { replyMessage, setReplyMessage } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      try {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (
          audioCtxRef.current &&
          typeof audioCtxRef.current.close === "function"
        )
          audioCtxRef.current.close();
        if (streamRef.current)
          streamRef.current.getTracks().forEach((t) => t.stop());
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        )
          mediaRecorderRef.current.stop();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  return (
    <div className="p-3 pt-0">
        {replyMessage && (
            <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/40 backdrop-blur-md p-3 rounded-t-xl border border-b-0 border-gray-200 dark:border-white/10 mb-[-1px] pb-5 relative z-0 mx-4 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-1 h-8 bg-purple-500 rounded-full shrink-0"/>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 truncate w-full tracking-wide">
                            Replying to {replyMessage.senderId === authUser._id ? "Yourself" : "Message"}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px] sm:max-w-xs font-medium">
                             {replyMessage.text || (replyMessage.audio ? "🎤 Voice Message" : "📷 Image")}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setReplyMessage(null)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative z-10">
      <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-900/20 border border-transparent dark:border-white/5 px-3 rounded-full transition-colors">
        <TextComposer
          text={text}
          setText={setText}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
          isRecording={isRecording}
        />

        <VoiceRecorder
          isRecording={isRecording}
          isPaused={isPaused}
          previewUrl={previewUrl}
          isPlaying={isPlaying}
          recordingTime={recordingTime}
          canvasRef={canvasRef}
          audioRef={audioRef}
          startRecording={startRecording}
          stopRecording={stopRecording}
          pauseRecording={pauseRecording}
          resumeRecording={resumeRecording}
          sendPreview={sendPreview}
          discardPreview={discardPreview}
          togglePlayback={togglePlayback}
        />
      </div>
      <SendButton disabled={isRecording || !!previewUrl} />
    </form>
  </div>
  );
}
