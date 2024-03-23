import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import { initSocket } from "../lib/socket";
import "../styles/globals.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    initSocket();
  }, []);

  return <Component {...pageProps} />;
};

export default MyApp;
