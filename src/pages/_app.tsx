// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { initGA, logPageView } from "../utils/analytics";
import useTheme from "../hooks/useTheme";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const { toggleTheme } = useTheme();

  useEffect(() => {
    initGA();
    logPageView();
  }, []);

  return (
    <>
      {/* Theme toggle button or switch */}
      <button onClick={toggleTheme}>Toggle Theme</button>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
