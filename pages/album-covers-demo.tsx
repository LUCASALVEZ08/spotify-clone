import { useState, useEffect } from "react";
import Head from "next/head";
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

export default function AlbumCoversDemo() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const response = await fetch("/api/songs/index-local?page=1&limit=50");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4">Carregando capas de álbuns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Capas de Álbuns - Spotify Clone</title>
      </Head>

      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-green-400">
            🎵 Capas de Álbuns
          </h1>

          <div className="mb-8">
            <p className="text-gray-300 text-lg">
              Visualize as capas de álbuns geradas automaticamente para suas
              músicas. Cada capa tem um design único baseado no título e artista
              da música.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <AlbumCover song={song} size="xl" />

                  <div className="text-center w-full">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {songs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Nenhuma música encontrada para exibir as capas.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
