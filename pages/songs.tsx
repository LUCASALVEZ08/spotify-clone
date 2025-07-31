import { useState, useEffect } from "react";
import Head from "next/head";
import { useAudio } from "@/contexts/AudioContext";
import AudioPlayer from "@/components/AudioPlayer";
import AlbumCover from "@/components/AlbumCover";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const loadSongs = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/songs/index-local?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao carregar músicas");
      }

      setSongs(data.songs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs(currentPage, search);
  }, [currentPage, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadSongs(1, search);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading && songs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4">Carregando músicas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Músicas - Spotify Clone</title>
      </Head>

      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-green-400">
            Biblioteca de Músicas
          </h1>

          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex gap-4 mb-4">
              <form onSubmit={handleSearch} className="flex gap-4 flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título ou artista..."
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  🔍 Buscar
                </button>
              </form>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-red-300 mb-2">
                ❌ Erro
              </h3>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {pagination && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {pagination.total}
                  </div>
                  <div className="text-gray-300">Total de Músicas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {pagination.page}
                  </div>
                  <div className="text-gray-300">Página Atual</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {pagination.pages}
                  </div>
                  <div className="text-gray-300">Total de Páginas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {pagination.limit}
                  </div>
                  <div className="text-gray-300">Por Página</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            {songs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {search
                    ? "Nenhuma música encontrada para sua busca."
                    : "Nenhuma música carregada ainda."}
                </p>
                {!search && (
                  <a
                    href="/upload-songs"
                    className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    🚀 Fazer Upload de Músicas
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <AlbumCover song={song} size="lg" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {song.title}
                          </h3>
                          <p className="text-gray-300">{song.artist}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-400">
                            <span>📁 {song.filename}</span>
                            <span>💾 {formatFileSize(song.fileSize)}</span>
                            <span>📅 {formatDate(song.uploadDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <div className="text-sm text-gray-400">
                            {song.genre} • {song.album}
                          </div>
                        </div>
                        <button
                          onClick={() => playSong(song, songs)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          title="Reproduzir"
                        >
                          ▶️ Reproduzir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ← Anterior
                </button>

                <span className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                  {currentPage} de {pagination.pages}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
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
