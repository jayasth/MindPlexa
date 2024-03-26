import type { AppProps } from "next/app";
import { useEffect } from "react";
import { io } from "socket.io-client";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const socket = io();

    return () => {
      socket.disconnect();
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
