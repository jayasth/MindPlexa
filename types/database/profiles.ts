export interface Profiles {
  Row: {
    id: string;
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    full_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    website?: string | null;
    email: string | null;
    phone?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    full_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    website?: string | null;
    email: string | null;
    phone?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}
