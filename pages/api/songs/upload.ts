import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongoose";
import Song from "@/lib/models/song";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

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

    const results = [];
    const errors = [];

    for (const filename of mp3Files) {
      try {
        const filePath = path.join(songsDir, filename);
        const stats = fs.statSync(filePath);

        // Extrair informações do nome do arquivo
        const nameWithoutExt = filename.replace(/\.mp3$/i, "");

        // Tentar extrair artista e título do nome do arquivo
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
        const existingSong = await Song.findOne({ filename });
        if (existingSong) {
          errors.push({
            filename,
            error: "Música já existe no banco de dados",
          });
          continue;
        }

        // Criar nova música
        const song = new Song({
          title,
          artist,
          filename,
          filePath: `/songs/${filename}`,
          fileSize: stats.size,
          uploadDate: new Date(),
        });

        await song.save();

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

    return res.status(200).json({
      message: "Upload concluído",
      totalFiles: mp3Files.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
