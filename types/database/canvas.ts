// File: types/database/canvas.ts
export interface Canvas {
  Row: {
    id: string;
    title: string;
    description: string | null;
    configuration: string; // JSON string of canvas configuration
    nodes: string[]; // Array of node IDs on the canvas
    edges: string[]; // Array of edge IDs on the canvas
    owner_id: string; // User or project ID that owns the canvas
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    title: string;
    description?: string;
    configuration?: string;
    nodes?: string[];
    edges?: string[];
    owner_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    title?: string;
    description?: string;
    configuration?: string;
    nodes?: string[];
    edges?: string[];
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
  };
}
