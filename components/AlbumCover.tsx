import Image from "next/image";
import { useState } from "react";

interface AlbumCoverProps {
  song: {
    title: string;
    artist: string;
    album?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showFallback?: boolean;
}

export default function AlbumCover({
  song,
  size = "md",
  className = "",
  showFallback = true,
}: AlbumCoverProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const generateImageName = (title: string, artist: string) => {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const cleanArtist = artist
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    return `${cleanArtist}-${cleanTitle}`;
  };

  const imageName = generateImageName(song.title, song.artist);
  const imagePath = `/album-covers/${imageName}.svg`;

  const generateGradient = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 60) % 360;

    return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 40%))`;
  };

  const gradient = generateGradient(song.title + song.artist);

  const getInitials = (title: string, artist: string) => {
    const titleInitial = title.charAt(0).toUpperCase();
    const artistInitial = artist.charAt(0).toUpperCase();
    return `${titleInitial}${artistInitial}`;
  };

  const initials = getInitials(song.title, song.artist);

  if (imageError || !showFallback) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-lg flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br`}
        style={{ background: gradient }}
        title={`${song.title} - ${song.artist}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className} relative rounded-lg overflow-hidden`}
    >
      <Image
        src={imagePath}
        alt={`Capa do álbum: ${song.title} - ${song.artist}`}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
        sizes={`(max-width: 768px) ${
          size === "sm"
            ? "32px"
            : size === "md"
            ? "48px"
            : size === "lg"
            ? "64px"
            : "96px"
        }`}
      />
    </div>
  );
}
