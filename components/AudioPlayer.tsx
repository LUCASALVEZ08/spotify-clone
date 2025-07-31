import { useState, useRef, useEffect } from "react";
import AlbumCover from "./AlbumCover";

interface Song {
  id: string;
  title: string;
  artist: string;
  filename: string;
  filePath: string;
  fileSize: number;
  duration: number;
  genre: string;
  album: string;
  uploadDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AudioPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  repeatMode: "none" | "one" | "all";
  isShuffled: boolean;
  progress: number;
  onProgressChange: (progress: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function AudioPlayer({
  currentSong,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onShuffle,
  onRepeat,
  repeatMode,
  isShuffled,
  progress,
  onProgressChange,
  volume,
  onVolumeChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => onNext();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * audio.duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 mt-10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          Nenhuma música selecionada
        </div>
      </div>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={`/api/songs/stream?filename=${encodeURIComponent(
          currentSong.filename
        )}`}
        preload="metadata"
      />

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <div
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <AlbumCover song={currentSong} size="md" />
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-medium truncate">
                  {currentSong.title}
                </h3>
                <p className="text-gray-400 text-sm truncate">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffled
                    ? "text-green-500"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Reprodução aleatória"
              >
                🔀
              </button>

              <button
                onClick={onPrevious}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Anterior"
              >
                ⏮️
              </button>

              <button
                onClick={isPlaying ? onPause : onPlay}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                title={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>

              <button
                onClick={onNext}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Próxima"
              >
                ⏭️
              </button>

              <button
                onClick={onRepeat}
                className={`p-2 rounded-full transition-colors ${
                  repeatMode === "none"
                    ? "text-gray-400 hover:text-white"
                    : repeatMode === "one"
                    ? "text-green-500"
                    : "text-blue-500"
                }`}
                title={
                  repeatMode === "none"
                    ? "Sem repetição"
                    : repeatMode === "one"
                    ? "Repetir uma"
                    : "Repetir todas"
                }
              >
                {repeatMode === "one" ? "🔂" : "🔁"}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 flex-1 justify-end">
              <span className="text-gray-400 text-sm">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                title="Volume"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
}
