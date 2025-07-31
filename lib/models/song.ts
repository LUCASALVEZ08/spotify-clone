import mongoose from "mongoose";

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

export default mongoose.models.Song || mongoose.model("Song", SongSchema);
