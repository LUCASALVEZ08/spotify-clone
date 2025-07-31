import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { filename } = req.query;

    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ message: "Filename is required" });
    }

    const songsDir = path.join(process.cwd(), "songs");
    const filePath = path.join(songsDir, filename);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Verificar se é um arquivo MP3
    if (!filename.toLowerCase().endsWith(".mp3")) {
      return res.status(400).json({ message: "Only MP3 files are allowed" });
    }

    // Obter estatísticas do arquivo
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Configurar headers para streaming
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    // Verificar se há range request (para streaming)
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Length", chunksize);

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Sem range request, enviar arquivo completo
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error("Erro ao servir arquivo:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
