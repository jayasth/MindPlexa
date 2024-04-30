export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      base_nodes: {
        Row: {
          canvas_id: string | null;
          color: string | null;
          created_at: string | null;
          height: number | null;
          id: string;
          position: Json | null;
          type: string | null;
          updated_at: string | null;
          width: number | null;
        };
        Insert: {
          canvas_id?: string | null;
          color?: string | null;
          created_at?: string | null;
          height?: number | null;
          id?: string;
          position?: Json | null;
          type?: string | null;
          updated_at?: string | null;
          width?: number | null;
        };
        Update: {
          canvas_id?: string | null;
          color?: string | null;
          created_at?: string | null;
          height?: number | null;
          id?: string;
          position?: Json | null;
          type?: string | null;
          updated_at?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'base_nodes_canvas_id_fkey';
            columns: ['canvas_id'];
            isOneToOne: false;
            referencedRelation: 'canvases';
            referencedColumns: ['id'];
          }
        ];
      };
      canvases: {
        Row: {
          content: string | null;
          created_at: string | null;
          custom_nodes: Json | null;
          description: string | null;
          id: string;
          name: string;
          nodes: Json | null;
          note_nodes: Json | null;
          task_nodes: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          custom_nodes?: Json | null;
          description?: string | null;
          id?: string;
          name: string;
          nodes?: Json | null;
          note_nodes?: Json | null;
          task_nodes?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          custom_nodes?: Json | null;
          description?: string | null;
          id?: string;
          name?: string;
          nodes?: Json | null;
          note_nodes?: Json | null;
          task_nodes?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'canvases_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      code_nodes: {
        Row: {
          base_node_id: string | null;
          code: string | null;
          id: string;
          language: string | null;
          title: string | null;
        };
        Insert: {
          base_node_id?: string | null;
          code?: string | null;
          id?: string;
          language?: string | null;
          title?: string | null;
        };
        Update: {
          base_node_id?: string | null;
          code?: string | null;
          id?: string;
          language?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'code_nodes_base_node_id_fkey';
            columns: ['base_node_id'];
            isOneToOne: false;
            referencedRelation: 'base_nodes';
            referencedColumns: ['id'];
          }
        ];
      };
      custom_nodes: {
        Row: {
          base_node_id: string | null;
          data: Json | null;
          id: string;
          title: string | null;
          type: string | null;
        };
        Insert: {
          base_node_id?: string | null;
          data?: Json | null;
          id?: string;
          title?: string | null;
          type?: string | null;
        };
        Update: {
          base_node_id?: string | null;
          data?: Json | null;
          id?: string;
          title?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'custom_nodes_base_node_id_fkey';
            columns: ['base_node_id'];
            isOneToOne: false;
            referencedRelation: 'base_nodes';
            referencedColumns: ['id'];
          }
        ];
      };

      draw_nodes: {
        Row: {
          base_node_id: string | null;
          data: Json | null;
          id: string;
          title: string | null;
        };
        Insert: {
          base_node_id?: string | null;
          data?: Json | null;
          id?: string;
          title?: string | null;
        };
        Update: {
          base_node_id?: string | null;
          data?: Json | null;
          id?: string;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'draw_nodes_base_node_id_fkey';
            columns: ['base_node_id'];
            isOneToOne: false;
            referencedRelation: 'base_nodes';
            referencedColumns: ['id'];
          }
        ];
      };

      note_nodes: {
        Row: {
          base_node_id: string | null;
          content: string | null;
          id: string;
          title: string | null;
        };
        Insert: {
          base_node_id?: string | null;
          content?: string | null;
          id?: string;
          title?: string | null;
        };
        Update: {
          base_node_id?: string | null;
          content?: string | null;
          id?: string;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'note_nodes_base_node_id_fkey';
            columns: ['base_node_id'];
            isOneToOne: false;
            referencedRelation: 'base_nodes';
            referencedColumns: ['id'];
          }
        ];
      };

      task_nodes: {
        Row: {
          base_node_id: string | null;
          completed: boolean | null;
          id: string;
          task: string | null;
          title: string | null;
        };
        Insert: {
          base_node_id?: string | null;
          completed?: boolean | null;
          id?: string;
          task?: string | null;
          title?: string | null;
        };
        Update: {
          base_node_id?: string | null;
          completed?: boolean | null;
          id?: string;
          task?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'task_nodes_base_node_id_fkey';
            columns: ['base_node_id'];
            isOneToOne: false;
            referencedRelation: 'base_nodes';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      duplicate_canvas: {
        Args: {
          original_canvas_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      price_interval: 'day' | 'week' | 'month' | 'year';
      price_type: 'one_time' | 'recurring';
      pricing_plan_interval: 'day' | 'week' | 'month' | 'year';
      pricing_type: 'one_time' | 'recurring';
      subscription_status:
        | 'trialing'
        | 'active'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'past_due'
        | 'unpaid'
        | 'paused';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
