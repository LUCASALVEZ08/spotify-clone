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

interface SongCardProps {
  song: Song;
  onPlay?: (song: Song) => void;
  isPlaying?: boolean;
  isCurrentSong?: boolean;
  className?: string;
}

export default function SongCard({
  song,
  onPlay,
  isPlaying = false,
  isCurrentSong = false,
  className = "",
}: SongCardProps) {
  const handlePlay = () => {
    if (onPlay) {
      onPlay(song);
    }
  };

  return (
    <div
      className={`bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-all duration-200 group cursor-pointer ${className} ${
        isCurrentSong ? "ring-2 ring-green-500" : ""
      }`}
      onClick={handlePlay}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <AlbumCover song={song} size="md" />

          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">
                {isPlaying ? "⏸️" : "▶️"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-medium truncate ${
              isCurrentSong ? "text-green-400" : "text-white"
            }`}
          >
            {song.title}
          </h3>
          <p className="text-xs text-gray-400 truncate">{song.artist}</p>
        </div>

        {isCurrentSong && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
