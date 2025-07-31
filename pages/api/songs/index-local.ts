import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const SONGS_FILE = path.join(process.cwd(), "data", "songs.json");

// Carregar músicas existentes
const loadSongs = () => {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      page = 1,
      limit = 20,
      search,
      artist,
      sort = "uploadDate",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Carregar todas as músicas
    let songs = loadSongs();

    // Aplicar filtros
    if (search) {
      const searchLower = search.toString().toLowerCase();
      songs = songs.filter(
        (song: any) =>
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower)
      );
    }

    if (artist) {
      const artistLower = artist.toString().toLowerCase();
      songs = songs.filter((song: any) =>
        song.artist.toLowerCase().includes(artistLower)
      );
    }

    // Aplicar ordenação
    if (sort === "title") {
      songs.sort((a: any, b: any) => a.title.localeCompare(b.title));
    } else if (sort === "artist") {
      songs.sort((a: any, b: any) => a.artist.localeCompare(b.artist));
    } else if (sort === "uploadDate") {
      songs.sort(
        (a: any, b: any) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    }

    const total = songs.length;
    const paginatedSongs = songs.slice(skip, skip + limitNum);

    return res.status(200).json({
      songs: paginatedSongs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      storageType: "local-json",
    });
  } catch (error) {
    console.error("Erro ao buscar músicas:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
