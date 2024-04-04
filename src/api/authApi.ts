// src/api/authApi.ts
import { supabase } from "../shared/supabase/supabaseClient";

export const signUp = async (email: string, password: string) => {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Error signing up:", error.message);
    throw error;
  }

  return user;
};

export const signIn = async (email: string, password: string) => {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error.message);
    throw error;
  }

  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error.message);
    throw error;
  }
};
