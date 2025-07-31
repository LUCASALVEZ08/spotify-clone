import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongoose";
import Song from "@/lib/models/song";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

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

    // Construir filtro de busca
    const filter: any = {};

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (artist) {
      filter.artist = { $regex: artist as string, $options: "i" };
    }

    // Construir ordenação
    let sortObj: any = {};
    if (sort === "title") {
      sortObj.title = 1;
    } else if (sort === "artist") {
      sortObj.artist = 1;
    } else if (sort === "uploadDate") {
      sortObj.uploadDate = -1;
    } else {
      sortObj.uploadDate = -1;
    }

    // Buscar músicas
    const songs = await Song.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .select("-__v");

    // Contar total de músicas
    const total = await Song.countDocuments(filter);

    return res.status(200).json({
      songs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar músicas:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
