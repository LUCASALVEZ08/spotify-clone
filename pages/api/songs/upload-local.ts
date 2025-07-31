import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const SONGS_FILE = path.join(process.cwd(), "data", "songs.json");

// Garantir que a pasta data existe
const ensureDataDir = () => {
  const dataDir = path.dirname(SONGS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Carregar músicas existentes
const loadSongs = () => {
  ensureDataDir();
  if (fs.existsSync(SONGS_FILE)) {
    try {
      const data = fs.readFileSync(SONGS_FILE, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Erro ao carregar arquivo de músicas:", error);
      return [];
    }
  }
  return [];
};

// Salvar músicas
const saveSongs = (songs: any[]) => {
  ensureDataDir();
  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const songsDir = path.join(process.cwd(), "songs");

    // Verificar se a pasta songs existe
    if (!fs.existsSync(songsDir)) {
      return res.status(404).json({ message: "Pasta songs não encontrada" });
    }

    // Ler todos os arquivos da pasta songs
    const files = fs.readdirSync(songsDir);
    const mp3Files = files.filter((file) =>
      file.toLowerCase().endsWith(".mp3")
    );

    if (mp3Files.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum arquivo MP3 encontrado na pasta songs" });
    }

    // Carregar músicas existentes
    const existingSongs = loadSongs();
    const existingFilenames = new Set(
      existingSongs.map((song: any) => song.filename)
    );

    const results = [];
    const errors = [];
    const newSongs = [];

    for (const filename of mp3Files) {
      try {
        const filePath = path.join(songsDir, filename);
        const stats = fs.statSync(filePath);

        const nameWithoutExt = filename.replace(/\.mp3$/i, "");

        let artist = "Unknown Artist";
        let title = nameWithoutExt;

        // Padrão comum: "Artista - Título"
        if (nameWithoutExt.includes(" - ")) {
          const parts = nameWithoutExt.split(" - ");
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(" - ").trim();
          }
        }

        // Padrão com vírgula: "Artista, Título"
        else if (nameWithoutExt.includes(", ")) {
          const parts = nameWithoutExt.split(", ");
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(", ").trim();
          }
        }

        // Verificar se a música já existe
        if (existingFilenames.has(filename)) {
          errors.push({
            filename,
            error: "Música já existe no banco de dados",
          });
          continue;
        }

        // Criar nova música
        const song = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          title,
          artist,
          filename,
          filePath: `/songs/${filename}`,
          fileSize: stats.size,
          duration: 0,
          genre: "Unknown",
          album: "Unknown",
          uploadDate: new Date().toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newSongs.push(song);

        results.push({
          filename,
          title,
          artist,
          fileSize: stats.size,
          success: true,
        });
      } catch (error) {
        errors.push({
          filename,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    // Salvar novas músicas
    if (newSongs.length > 0) {
      const allSongs = [...existingSongs, ...newSongs];
      saveSongs(allSongs);
    }

    return res.status(200).json({
      message: "Upload concluído (armazenado localmente)",
      totalFiles: mp3Files.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
      storageType: "local-json",
      filePath: SONGS_FILE,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
