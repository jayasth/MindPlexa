// pages/_app.tsx
import React from "react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import "../styles/components.css"; // If components.css is for global components styles

const MyApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;
