import { Json } from './common';

export interface Products {
  Row: {
    active: boolean | null;
    description: string | null;
    id: string;
    image: string | null;
    metadata: Json | null;
    name: string | null;
  };
  Insert: {
    active?: boolean | null;
    description?: string | null;
    id: string;
    image?: string | null;
    metadata?: Json | null;
    name?: string | null;
  };
  Update: {
    active?: boolean | null;
    description?: string | null;
    id?: string;
    image?: string | null;
    metadata?: Json | null;
    name?: string | null;
  };
  Relationships: []; // Assuming no relationships are defined in the provided types
}
