import type { AppProps } from "next/app";
import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
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

  return <Component {...pageProps} />;
}

export default MyApp;
