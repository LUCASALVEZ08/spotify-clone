import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AudioProvider } from "@/contexts/AudioContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AudioProvider>
      <Component {...pageProps} />
    </AudioProvider>
  );
}
