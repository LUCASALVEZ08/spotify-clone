const fs = require('fs');
const path = require('path');

// Função para gerar um hash simples baseado em uma string
function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Função para gerar cores baseadas no hash
function generateColors(hash) {
  const hue1 = hash % 360;
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 120) % 360;
  
  return {
    color1: `hsl(${hue1}, 70%, 60%)`,
    color2: `hsl(${hue2}, 70%, 40%)`,
    color3: `hsl(${hue3}, 70%, 50%)`
  };
}

// Função para limpar texto para nome de arquivo
function cleanFileName(text) {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

// Função para gerar SVG da capa
function generateCoverSVG(title, artist, colors) {
  const initials = `${title.charAt(0).toUpperCase()}${artist.charAt(0).toUpperCase()}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.color1};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.color2};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.color3};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="300" height="300" fill="url(#gradient)" rx="20" ry="20"/>
  
  <!-- Musical note icon -->
  <g transform="translate(150, 120)">
    <circle cx="0" cy="0" r="8" fill="rgba(255,255,255,0.2)"/>
    <path d="M-4,-8 L-4,8 L4,8 L4,-8 Z" fill="rgba(255,255,255,0.3)"/>
    <circle cx="0" cy="-12" r="4" fill="rgba(255,255,255,0.4)"/>
  </g>
  
  <!-- Text -->
  <text x="150" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    ${initials}
  </text>
  
  <!-- Subtle pattern -->
  <g opacity="0.1">
    <circle cx="50" cy="50" r="2" fill="white"/>
    <circle cx="250" cy="80" r="1.5" fill="white"/>
    <circle cx="80" cy="250" r="1" fill="white"/>
    <circle cx="220" cy="220" r="2.5" fill="white"/>
  </g>
</svg>`;
}

// Função principal
function generateCovers() {
  const songsPath = path.join(__dirname, '../data/songs.json');
  const coversDir = path.join(__dirname, '../public/album-covers');
  
  // Criar diretório se não existir
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
  
  try {
    const songsData = fs.readFileSync(songsPath, 'utf8');
    const songs = JSON.parse(songsData);
    
    console.log(`Gerando capas para ${songs.length} músicas...`);
    
    let generatedCount = 0;
    
    songs.forEach((song, index) => {
      const fileName = `${cleanFileName(song.artist)}-${cleanFileName(song.title)}.svg`;
      const filePath = path.join(coversDir, fileName);
      
      // Gerar hash baseado no título e artista
      const hash = generateHash(song.title + song.artist);
      const colors = generateColors(hash);
      
      // Gerar SVG
      const svgContent = generateCoverSVG(song.title, song.artist, colors);
      
      // Salvar arquivo
      fs.writeFileSync(filePath, svgContent);
      generatedCount++;
      
      if (index % 50 === 0) {
        console.log(`Progresso: ${index + 1}/${songs.length}`);
      }
    });
    
    console.log(`✅ ${generatedCount} capas geradas com sucesso em ${coversDir}`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar capas:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateCovers();
}

module.exports = { generateCovers }; 