# 🎵 Capas de Álbuns - Spotify Clone

Este projeto agora inclui um sistema completo de capas de álbuns para suas músicas!

## ✨ Funcionalidades Implementadas

### 1. **Componente AlbumCover**
- **Localização**: `components/AlbumCover.tsx`
- **Funcionalidades**:
  - Exibe capas de álbuns SVG geradas automaticamente
  - Fallback com gradientes coloridos baseados no título/artista
  - Múltiplos tamanhos: `sm`, `md`, `lg`, `xl`
  - Iniciais da música no fallback

### 2. **Geração Automática de Capas**
- **Script**: `scripts/generate-covers.js`
- **Localização das capas**: `public/album-covers/`
- **Formato**: SVG com gradientes únicos
- **Nomenclatura**: `artista-titulo.svg`

### 3. **Componente SongCard**
- **Localização**: `components/SongCard.tsx`
- **Funcionalidades**:
  - Card de música com capa de álbum
  - Overlay de play no hover
  - Indicador de música atual
  - Design responsivo

## 🚀 Como Usar

### 1. **Gerar Capas de Álbuns**
```bash
node scripts/generate-covers.js
```

### 2. **Usar o Componente AlbumCover**
```tsx
import AlbumCover from "@/components/AlbumCover";

// Uso básico
<AlbumCover song={song} />

// Com tamanho específico
<AlbumCover song={song} size="xl" />

// Sem fallback (só imagem)
<AlbumCover song={song} showFallback={false} />
```

### 3. **Usar o Componente SongCard**
```tsx
import SongCard from "@/components/SongCard";

<SongCard 
  song={song}
  onPlay={handlePlaySong}
  isPlaying={isCurrentlyPlaying}
  isCurrentSong={isCurrentSong}
/>
```

## 📱 Páginas de Exemplo

### 1. **Biblioteca de Música Moderna**
- **URL**: `/music-library`
- **Características**: Interface moderna com cards de música

### 2. **Demonstração de Capas**
- **URL**: `/album-covers-demo`
- **Características**: Grade visual de todas as capas

### 3. **Página de Músicas Atualizada**
- **URL**: `/songs`
- **Características**: Lista de músicas com capas integradas

## 🎨 Personalização

### Cores dos Gradientes
As cores são geradas automaticamente baseadas no hash do título + artista:
- Cada música tem um gradiente único
- Cores consistentes para a mesma música
- Fallback visualmente atrativo

### Tamanhos Disponíveis
- `sm`: 32x32px
- `md`: 48x48px (padrão)
- `lg`: 64x64px
- `xl`: 96x96px

## 🔧 Estrutura de Arquivos

```
public/
  album-covers/          # Capas SVG geradas
    artista-titulo.svg   # Exemplo de nome de arquivo

components/
  AlbumCover.tsx         # Componente de capa
  SongCard.tsx          # Card de música

scripts/
  generate-covers.js     # Gerador de capas

pages/
  music-library.tsx     # Biblioteca moderna
  album-covers-demo.tsx # Demonstração
  songs.tsx            # Lista atualizada
```

## 🎯 Próximos Passos

1. **Adicionar capas reais**: Substitua os SVGs por imagens reais de álbuns
2. **Upload de capas**: Implemente sistema de upload de capas
3. **Cache de imagens**: Otimize carregamento com cache
4. **Animações**: Adicione animações de hover e transições

## 💡 Dicas

- As capas são geradas automaticamente para todas as músicas no `data/songs.json`
- Execute o script de geração sempre que adicionar novas músicas
- O fallback garante que sempre haverá uma visualização, mesmo sem imagem
- Os gradientes são consistentes para a mesma música

---

**Desenvolvido para o Spotify Clone** 🎵 