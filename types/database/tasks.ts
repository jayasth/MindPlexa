// File: types/database/taskNodes.ts
export interface Tasks {
  Row: {
    id: string;
    title: string;
    description: string | null;
    project_id: string;
    due_date: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
  };
  Insert: {
    title: string;
    description?: string;
    project_id: string;
    due_date?: string;
    status?: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id: string;
    title?: string;
    description?: string;
    due_date?: string;
    status?: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    created_at?: string;
    updated_at?: string;
  };
}
