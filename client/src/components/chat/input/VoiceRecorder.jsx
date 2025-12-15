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
    <>
      {/* visualizer + timer while recording */}
      {isRecording && (
        <div className="flex items-center gap-2 ml-2">
          <canvas ref={canvasRef} width={200} height={48} className="rounded" />
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
            onPlay={() => {}}
            onPause={() => {}}
            onEnded={() => {}}
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
              discardPreview();
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
    </>
  );
}
