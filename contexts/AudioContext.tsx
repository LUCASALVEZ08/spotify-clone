import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  filename: string;
  filePath: string;
  fileSize: number;
  duration: number;
  genre: string;
  album: string;
  uploadDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AudioState {
  currentSong: Song | null;
  playlist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  repeatMode: "none" | "one" | "all";
  isShuffled: boolean;
  shuffledPlaylist: Song[];
}

type AudioAction =
  | { type: "SET_CURRENT_SONG"; payload: Song }
  | { type: "SET_PLAYLIST"; payload: Song[] }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "TOGGLE_REPEAT" }
  | { type: "TOGGLE_SHUFFLE" }
  | { type: "PLAY_SONG"; payload: { song: Song; playlist?: Song[] } };

const initialState: AudioState = {
  currentSong: null,
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.7,
  repeatMode: "none",
  isShuffled: false,
  shuffledPlaylist: [],
};

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case "SET_CURRENT_SONG":
      return {
        ...state,
        currentSong: action.payload,
      };

    case "SET_PLAYLIST":
      return {
        ...state,
        playlist: action.payload,
        shuffledPlaylist: action.payload,
      };

    case "PLAY":
      return {
        ...state,
        isPlaying: true,
      };

    case "PAUSE":
      return {
        ...state,
        isPlaying: false,
      };

    case "NEXT": {
      const currentPlaylist = state.isShuffled
        ? state.shuffledPlaylist
        : state.playlist;
      if (currentPlaylist.length === 0) return state;

      let nextIndex = state.currentIndex + 1;

      if (nextIndex >= currentPlaylist.length) {
        if (state.repeatMode === "all") {
          nextIndex = 0;
        } else {
          return { ...state, isPlaying: false };
        }
      }

      return {
        ...state,
        currentIndex: nextIndex,
        currentSong: currentPlaylist[nextIndex],
        isPlaying: true,
      };
    }

    case "PREVIOUS": {
      const currentPlaylist = state.isShuffled
        ? state.shuffledPlaylist
        : state.playlist;
      if (currentPlaylist.length === 0) return state;

      let prevIndex = state.currentIndex - 1;

      if (prevIndex < 0) {
        if (state.repeatMode === "all") {
          prevIndex = currentPlaylist.length - 1;
        } else {
          return state;
        }
      }

      return {
        ...state,
        currentIndex: prevIndex,
        currentSong: currentPlaylist[prevIndex],
        isPlaying: true,
      };
    }

    case "SET_VOLUME":
      return {
        ...state,
        volume: action.payload,
      };

    case "TOGGLE_REPEAT": {
      const modes: ("none" | "one" | "all")[] = ["none", "one", "all"];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;

      return {
        ...state,
        repeatMode: modes[nextIndex],
      };
    }

    case "TOGGLE_SHUFFLE": {
      const newShuffled = !state.isShuffled;
      let shuffledPlaylist = state.playlist;

      if (newShuffled) {
        shuffledPlaylist = [...state.playlist].sort(() => Math.random() - 0.5);
      }

      return {
        ...state,
        isShuffled: newShuffled,
        shuffledPlaylist,
        currentIndex: newShuffled
          ? shuffledPlaylist.findIndex(
              (song) => song.id === state.currentSong?.id
            )
          : state.playlist.findIndex(
              (song) => song.id === state.currentSong?.id
            ),
      };
    }

    case "PLAY_SONG": {
      const { song, playlist } = action.payload;
      const newPlaylist = playlist || [song];
      const songIndex = newPlaylist.findIndex((s) => s.id === song.id);

      return {
        ...state,
        currentSong: song,
        playlist: newPlaylist,
        currentIndex: songIndex,
        isPlaying: true,
        shuffledPlaylist: newPlaylist,
      };
    }

    default:
      return state;
  }
}

interface AudioContextType {
  state: AudioState;
  dispatch: React.Dispatch<AudioAction>;
  playSong: (song: Song, playlist?: Song[]) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState);

  const playSong = (song: Song, playlist?: Song[]) => {
    dispatch({ type: "PLAY_SONG", payload: { song, playlist } });
  };

  const play = () => dispatch({ type: "PLAY" });
  const pause = () => dispatch({ type: "PAUSE" });
  const next = () => dispatch({ type: "NEXT" });
  const previous = () => dispatch({ type: "PREVIOUS" });
  const setVolume = (volume: number) =>
    dispatch({ type: "SET_VOLUME", payload: volume });
  const toggleRepeat = () => dispatch({ type: "TOGGLE_REPEAT" });
  const toggleShuffle = () => dispatch({ type: "TOGGLE_SHUFFLE" });

  const value: AudioContextType = {
    state,
    dispatch,
    playSong,
    play,
    pause,
    next,
    previous,
    setVolume,
    toggleRepeat,
    toggleShuffle,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
