export interface NodeConnections {
  Row: {
    id: string;
    source_node_id: string;
    target_node_id: string;
    project_id: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    source_node_id: string;
    target_node_id: string;
    project_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    source_node_id?: string;
    target_node_id?: string;
    project_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: 'node_connections_source_node_id_fkey';
      columns: ['source_node_id'];
      isOneToOne: false;
      referencedRelation: 'nodes';
      referencedColumns: ['id'];
    },
    {
      foreignKeyName: 'node_connections_target_node_id_fkey';
      columns: ['target_node_id'];
      isOneToOne: false;
      referencedRelation: 'nodes';
      referencedColumns: ['id'];
    },
    {
      foreignKeyName: 'node_connections_project_id_fkey';
      columns: ['project_id'];
      isOneToOne: false;
      referencedRelation: 'projects';
      referencedColumns: ['id'];
    }
  ];
}
