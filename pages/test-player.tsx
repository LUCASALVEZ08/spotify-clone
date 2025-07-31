import { useState, useEffect } from "react";
import Head from "next/head";
import { useAudio } from "@/contexts/AudioContext";
import AudioPlayer from "@/components/AudioPlayer";

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

export default function TestPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { state, playSong } = useAudio();

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const response = await fetch("/api/songs/index-local?limit=5");
        const data = await response.json();

        if (response.ok) {
          setSongs(data.songs);
        }
      } catch (error) {
        console.error("Erro ao carregar músicas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, []);

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4">Carregando músicas de teste...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Teste do Player - Spotify Clone</title>
      </Head>

      <div className="min-h-screen bg-gray-900 text-white p-8 pb-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-green-400">
            🎵 Teste do Player de Música
          </h1>

          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Status do Player</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Música Atual:</h3>
                <p className="text-gray-300">
                  {state.currentSong ? (
                    <>
                      <strong>{state.currentSong.title}</strong>
                      <br />
                      <span className="text-sm">
                        {state.currentSong.artist}
                      </span>
                    </>
                  ) : (
                    "Nenhuma música selecionada"
                  )}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Status:</h3>
                <p className="text-gray-300">
                  {state.isPlaying ? "▶️ Reproduzindo" : "⏸️ Pausado"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Músicas Disponíveis (Primeiras 5)
            </h2>

            {songs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Nenhuma música encontrada. Faça upload primeiro!
                </p>
                <a
                  href="/upload-songs"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  🚀 Fazer Upload
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {songs.map((song, index) => (
                  <div
                    key={song.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎵</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {song.title}
                            </h3>
                            <p className="text-gray-300">{song.artist}</p>
                            <div className="flex gap-4 mt-1 text-sm text-gray-400">
                              <span>💾 {formatFileSize(song.fileSize)}</span>
                              <span>📁 {song.filename}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => playSong(song, songs)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          ▶️ Reproduzir
                        </button>
                        <button
                          onClick={() => playSong(song)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          🎵 Solo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/songs"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              📚 Ver Todas as Músicas
            </a>
          </div>
        </div>
      </div>

      <AudioPlayer
        currentSong={state.currentSong}
        isPlaying={state.isPlaying}
        onPlay={() => {}}
        onPause={() => {}}
        onNext={() => {}}
        onPrevious={() => {}}
        onShuffle={() => {}}
        onRepeat={() => {}}
        repeatMode={state.repeatMode}
        isShuffled={state.isShuffled}
        progress={0}
        onProgressChange={() => {}}
        volume={state.volume}
        onVolumeChange={() => {}}
      />
    </>
  );
}
