export interface Nodes {
  Row: {
    id: string;
    title: string;
    content: string | null;
    project_id: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    title: string;
    content?: string;
    project_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    title?: string;
    content?: string;
    project_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: 'nodes_project_id_fkey';
      columns: ['project_id'];
      isOneToOne: false;
      referencedRelation: 'projects';
      referencedColumns: ['id'];
    }
  ];
}
