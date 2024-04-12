//import { Json } from './common';

export interface Workspaces {
  Row: {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    name: string;
    description?: string;
    owner_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    description?: string;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: 'workspaces_owner_id_fkey';
      columns: ['owner_id'];
      isOneToOne: false;
      referencedRelation: 'users';
      referencedColumns: ['id'];
    }
  ];
}
