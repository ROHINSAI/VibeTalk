import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

const CustomAudioPlayer = ({ src, isSentByMe }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
    };

    const setAudioDuration = () => {
        setDuration(audio.duration);
    };

    const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
        audioRef.current.currentTime = newTime;
        setProgress(e.target.value);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center gap-3 w-[220px] ${
        isSentByMe ? "text-white" : "text-gray-900 dark:text-white"
    }`}>
      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
            isSentByMe 
            ? "bg-white/20 hover:bg-white/30 text-white" 
            : "bg-violet-100 dark:bg-violet-500/20 hover:bg-violet-200 dark:hover:bg-violet-500/30 text-violet-600 dark:text-violet-300"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none bg-black/10 dark:bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full ${
            isSentByMe 
                ? "[&::-webkit-slider-thumb]:bg-white" 
                : "[&::-webkit-slider-thumb]:bg-violet-600 dark:[&::-webkit-slider-thumb]:bg-violet-400"
          }`}
        />
        <div className={`flex justify-between text-[10px] font-medium opacity-80`}>
           <span>{formatTime(currentTime)}</span>
           <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={src} className="hidden" />
    </div>
  );
};

export default CustomAudioPlayer;
