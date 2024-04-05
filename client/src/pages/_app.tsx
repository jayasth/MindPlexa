import type { AppProps } from "next/app";
import React, { useEffect } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "../services/api/supabase/supabaseClient";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // Perform any necessary actions on successful sign-in
      } else if (event === "SIGNED_OUT") {
        // Perform any necessary actions on sign-out
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;
