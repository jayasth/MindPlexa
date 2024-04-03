// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "../shared/utils/supabaseClient";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          // Perform any necessary actions on successful sign-in
        } else if (event === "SIGNED_OUT") {
          // Perform any necessary actions on sign-out
        }
      }
    );

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
