import { useState, useEffect } from "react";
import Head from "next/head";
import { useAudio } from "@/contexts/AudioContext";
import AudioPlayer from "@/components/AudioPlayer";
import SongCard from "@/components/SongCard";

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

export default function MusicLibrary() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);

  const {
    state,
    playSong,
    play,
    pause,
    next,
    previous,
    setVolume,
    toggleRepeat,
    toggleShuffle,
  } = useAudio();

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const response = await fetch("/api/songs/index-local?page=1&limit=100");
        const data = await response.json();

        if (response.ok) {
          setSongs(data.songs);
          setFilteredSongs(data.songs);
        }
      } catch (error) {
        console.error("Erro ao carregar músicas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(search.toLowerCase()) ||
          song.artist.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSongs(filtered);
    }
  }, [search, songs]);

  const handlePlaySong = (song: Song) => {
    playSong(song, songs);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4">Carregando biblioteca de música...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Biblioteca de Música - Spotify Clone</title>
      </Head>

      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-green-400">
              🎵 Sua Biblioteca
            </h1>
            <p className="text-gray-300">
              {songs.length} músicas em sua biblioteca
            </p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título ou artista..."
                className="w-full bg-gray-800 text-white px-4 py-3 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-700"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {songs.length}
              </div>
              <div className="text-gray-300 text-sm">Total de Músicas</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {new Set(songs.map((s) => s.artist)).size}
              </div>
              <div className="text-gray-300 text-sm">Artistas Únicos</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {filteredSongs.length}
              </div>
              <div className="text-gray-300 text-sm">Resultados da Busca</div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredSongs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {search
                    ? "Nenhuma música encontrada para sua busca."
                    : "Nenhuma música em sua biblioteca."}
                </p>
              </div>
            ) : (
              filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPlay={handlePlaySong}
                  isPlaying={
                    state.isPlaying && state.currentSong?.id === song.id
                  }
                  isCurrentSong={state.currentSong?.id === song.id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <AudioPlayer
        currentSong={state.currentSong}
        isPlaying={state.isPlaying}
        onPlay={play}
        onPause={pause}
        onNext={next}
        onPrevious={previous}
        onShuffle={toggleShuffle}
        onRepeat={toggleRepeat}
        repeatMode={state.repeatMode}
        isShuffled={state.isShuffled}
        progress={0}
        onProgressChange={() => {}}
        volume={state.volume}
        onVolumeChange={setVolume}
      />
    </>
  );
}
