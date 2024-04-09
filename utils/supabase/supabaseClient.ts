import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';
import { Profile } from '@/types';

// Define a function to create a Supabase client for client-side operations
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const updateProfile = async (userId: string, data: Partial<Profile>) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
};
