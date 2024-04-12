export interface Projects {
  Row: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
}
