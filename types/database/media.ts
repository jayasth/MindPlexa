// File: types/database/mediaNodes.ts
export interface Media {
  Row: {
    id: string;
    title: string;
    description: string | null;
    project_id: string;
    media_url: string;
    media_type: 'image' | 'video' | 'audio';
    created_at: string;
    updated_at: string;
  };
  Insert: {
    title: string;
    description?: string;
    project_id: string;
    media_url: string;
    media_type: 'image' | 'video' | 'audio';
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id: string;
    title?: string;
    description?: string;
    media_url?: string;
    media_type?: 'image' | 'video' | 'audio';
    created_at?: string;
    updated_at?: string;
  };
}
