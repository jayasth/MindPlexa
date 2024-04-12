// File: types/database/canvas.ts
export interface Canvases {
  Row: {
    id: string;
    configuration: string; // JSON string of canvas configuration
    nodes: string[]; // Array of node IDs on the canvas
    owner_id: string; // User or project ID that owns the canvas
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    configuration?: string;
    nodes?: string[];
    owner_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    configuration?: string;
    nodes?: string[];
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
  };
}
