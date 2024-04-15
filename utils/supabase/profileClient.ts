import { createBrowserClient } from '@supabase/ssr';
import type { Database } from 'types_db';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

type UpdateProfileData = {
  id?: string;
  user_id?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;
  // Make email optional, but when it's provided, it should not be undefined
  email: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileData
) => {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
};
