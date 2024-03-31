// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { initGA, logPageView } from "../utils/analytics";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initGA();
    logPageView();
  }, []);

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
