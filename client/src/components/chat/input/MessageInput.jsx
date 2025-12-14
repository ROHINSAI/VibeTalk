import assets from "../../../assets/assets";
import { useRef, useState, useEffect } from "react";

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
    <form onSubmit={handleSendMessage} className="flex items-center gap-3 p-3">
      <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isRecording}
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
        <label
          htmlFor="image"
          className={`${isRecording ? "pointer-events-none opacity-40" : ""}`}
        >
          <img
            src={assets.gallery_icon}
            alt="Upload"
            className="w-5 mr-2 cursor-pointer"
          />
        </label>
        {/* visualizer + timer while recording */}
        {isRecording && (
          <div className="flex items-center gap-2 ml-2">
            <canvas
              ref={canvasRef}
              width={200}
              height={48}
              className="rounded"
            />
            <div className="text-xs text-gray-300 monospace ml-1">
              {`${String(Math.floor(recordingTime / 60)).padStart(
                2,
                "0"
              )}:${String(recordingTime % 60).padStart(2, "0")}`}
            </div>
          </div>
        )}
        {/* Recording controls and preview */}
        {!previewUrl && (
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    isPaused ? resumeRecording() : pauseRecording()
                  }
                  className="ml-2 mr-2 text-sm px-2 py-1 rounded bg-yellow-600 text-white"
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="ml-2 mr-2 text-sm px-2 py-1 rounded bg-red-600 text-white"
                >
                  Stop
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="ml-2 mr-2 text-sm px-2 py-1 rounded bg-gray-700 text-white"
              >
                🎤
              </button>
            )}
          </div>
        )}

        {previewUrl && (
          <div className="flex items-center gap-2">
            <audio
              ref={audioRef}
              src={previewUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            <button
              type="button"
              onClick={togglePlayback}
              className="ml-2 mr-2 text-sm px-2 py-1 rounded bg-gray-700 text-white"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={sendPreview}
              className="ml-2 text-sm px-3 py-1 rounded bg-green-600 text-white"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => {
                // re-record: clear preview and allow starting a new recording
                discardPreview();
                // small timeout to ensure state cleared before re-recording
                setTimeout(() => {
                  startRecording();
                }, 120);
              }}
              className="ml-2 text-sm px-3 py-1 rounded bg-indigo-600 text-white"
            >
              Re-record
            </button>
            <button
              type="button"
              onClick={discardPreview}
              className="ml-2 text-sm px-3 py-1 rounded bg-gray-600 text-white"
            >
              Discard
            </button>
          </div>
        )}
      </div>
      <button type="submit" disabled={isRecording || !!previewUrl}>
        <img
          src={assets.send_button}
          alt="Send"
          className="w-7 cursor-pointer"
        />
      </button>
    </form>
  );
}
