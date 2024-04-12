export interface Insights {
  Row: {
    id: string;
    title: string;
    description: string | null;
    workspace_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    title: string;
    description?: string;
    workspace_id: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    title?: string;
    description?: string;
    workspace_id?: string;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: 'insights_workspace_id_fkey';
      columns: ['workspace_id'];
      isOneToOne: false;
      referencedRelation: 'workspaces';
      referencedColumns: ['id'];
    },
    {
      foreignKeyName: 'insights_user_id_fkey';
      columns: ['user_id'];
      isOneToOne: false;
      referencedRelation: 'users';
      referencedColumns: ['id'];
    }
  ];
}
