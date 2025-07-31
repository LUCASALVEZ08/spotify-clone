const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const SongSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    genre: {
      type: String,
      default: "Unknown",
    },
    year: {
      type: Number,
    },
    album: {
      type: String,
      default: "Unknown",
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SongSchema.index({ title: "text", artist: "text" });
SongSchema.index({ filename: 1 });
SongSchema.index({ artist: 1 });

const Song = mongoose.models.Song || mongoose.model("Song", SongSchema);

async function uploadSongs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");

    const songsDir = path.join(process.cwd(), "songs");

    if (!fs.existsSync(songsDir)) {
      console.error("❌ Pasta songs não encontrada");
      process.exit(1);
    }

    const files = fs.readdirSync(songsDir);
    const mp3Files = files.filter((file) =>
      file.toLowerCase().endsWith(".mp3")
    );

    if (mp3Files.length === 0) {
      console.error("❌ Nenhum arquivo MP3 encontrado na pasta songs");
      process.exit(1);
    }

    console.log(`📁 Encontrados ${mp3Files.length} arquivos MP3`);

    const results = [];
    const errors = [];

    for (let i = 0; i < mp3Files.length; i++) {
      const filename = mp3Files[i];
      console.log(`\n🔄 Processando ${i + 1}/${mp3Files.length}: ${filename}`);

      try {
        const filePath = path.join(songsDir, filename);
        const stats = fs.statSync(filePath);

        const nameWithoutExt = filename.replace(/\.mp3$/i, "");

        let artist = "Unknown Artist";
        let title = nameWithoutExt;

        if (nameWithoutExt.includes(" - ")) {
          const parts = nameWithoutExt.split(" - ");
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(" - ").trim();
          }
        } else if (nameWithoutExt.includes(", ")) {
          const parts = nameWithoutExt.split(", ");
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(", ").trim();
          }
        }
        const existingSong = await Song.findOne({ filename });
        if (existingSong) {
          console.log(`⚠️  Música já existe: ${filename}`);
          errors.push({
            filename,
            error: "Música já existe no banco de dados",
          });
          continue;
        }

        const song = new Song({
          title,
          artist,
          filename,
          filePath: `/songs/${filename}`,
          fileSize: stats.size,
          uploadDate: new Date(),
        });

        await song.save();

        console.log(`✅ Uploadado: ${artist} - ${title}`);

        results.push({
          filename,
          title,
          artist,
          fileSize: stats.size,
          success: true,
        });
      } catch (error) {
        console.error(`❌ Erro ao processar ${filename}:`, error.message);
        errors.push({
          filename,
          error: error.message,
        });
      }
    }

    console.log("\n📊 RESUMO DO UPLOAD:");
    console.log(`✅ Sucessos: ${results.length}`);
    console.log(`❌ Erros: ${errors.length}`);
    console.log(`📁 Total de arquivos: ${mp3Files.length}`);

    if (errors.length > 0) {
      console.log("\n❌ ERROS:");
      errors.forEach((error) => {
        console.log(`  - ${error.filename}: ${error.error}`);
      });
    }

    await mongoose.disconnect();
    console.log("\n🔌 Desconectado do MongoDB");
  } catch (error) {
    console.error("❌ Erro geral:", error);
    process.exit(1);
  }
}

uploadSongs();
