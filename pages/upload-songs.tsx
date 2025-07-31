import { useState } from "react";
import Head from "next/head";

export default function UploadSongs() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/songs/upload-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro no upload");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Upload de Músicas - Spotify Clone</title>
      </Head>

      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-green-400">
            Upload de Músicas
          </h1>

          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Enviar músicas para o MongoDB
            </h2>

            <p className="text-gray-300 mb-6">
              Este botão irá processar todos os arquivos MP3 da pasta{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">songs/</code> e
              salvá-los em um arquivo JSON local (solução temporária enquanto o MongoDB Atlas não está configurado).
            </p>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isUploading ? "🔄 Processando..." : "🚀 Iniciar Upload"}
            </button>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-red-300 mb-2">
                ❌ Erro
              </h3>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-400 mb-4">
                ✅ Upload Concluído
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {result.totalFiles}
                  </div>
                  <div className="text-gray-300">Total de Arquivos</div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {result.successful}
                  </div>
                  <div className="text-gray-300">Sucessos</div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {result.failed}
                  </div>
                  <div className="text-gray-300">Falhas</div>
                </div>
              </div>

              {result.results && result.results.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-green-300">
                    Músicas Enviadas:
                  </h4>
                  <div className="max-h-60 overflow-y-auto">
                    {result.results.map((song: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-700 rounded-lg p-3 mb-2"
                      >
                        <div className="font-medium">
                          {song.artist} - {song.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {song.filename} (
                          {(song.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-red-300">
                    Erros:
                  </h4>
                  <div className="max-h-60 overflow-y-auto">
                    {result.errors.map((error: any, index: number) => (
                      <div
                        key={index}
                        className="bg-red-900 border border-red-700 rounded-lg p-3 mb-2"
                      >
                        <div className="font-medium">{error.filename}</div>
                        <div className="text-sm text-red-300">
                          {error.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
