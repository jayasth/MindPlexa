import { Json } from './common';

export interface Users {
  Row: {
    id: string;
    avatar_url: string | null;
    billing_address: Json | null;
    full_name: string | null;
    payment_method: Json | null;
  };
  Insert: {
    id: string;
    avatar_url?: string | null;
    billing_address?: Json | null;
    full_name?: string | null;
    payment_method?: Json | null;
  };
  Update: {
    id?: string;
    avatar_url?: string | null;
    billing_address?: Json | null;
    full_name?: string | null;
    payment_method?: Json | null;
  };
  Relationships: [
    {
      foreignKeyName: 'users_id_fkey';
      columns: ['id'];
      isOneToOne: true;
      referencedRelation: 'users';
      referencedColumns: ['id'];
    }
  ];
}
