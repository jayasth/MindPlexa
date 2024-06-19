export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      base_nodes: {
        Row: {
          canvas_id: string | null
          color: string | null
          created_at: string | null
          height: number | null
          id: string
          position: Json | null
          type: string | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          canvas_id?: string | null
          color?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          position?: Json | null
          type?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          canvas_id?: string | null
          color?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          position?: Json | null
          type?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "base_nodes_canvas_id_fkey"
            columns: ["canvas_id"]
            isOneToOne: false
            referencedRelation: "canvases"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_nodes: {
        Row: {
          attached_files: Json | null
          background_color: string | null
          base_node_id: string | null
          events: Json | null
          id: string
          tags: string[] | null
          text_color: string | null
          title: string | null
          view: string | null
        }
        Insert: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          events?: Json | null
          id?: string
          tags?: string[] | null
          text_color?: string | null
          title?: string | null
          view?: string | null
        }
        Update: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          events?: Json | null
          id?: string
          tags?: string[] | null
          text_color?: string | null
          title?: string | null
          view?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_nodes_base_node_id_fkey"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_calendar_nodes_base_node_id"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_node_relationships: {
        Row: {
          canvas_id: string
          node_id: string
          node_type: string
        }
        Insert: {
          canvas_id: string
          node_id: string
          node_type: string
        }
        Update: {
          canvas_id?: string
          node_id?: string
          node_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_node_fk"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "calendar_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canvas_node_relationships_canvas_id_fkey"
            columns: ["canvas_id"]
            isOneToOne: false
            referencedRelation: "canvases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_node_fk"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "draw_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_node_fk"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "note_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_node_fk"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "table_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_node_fk"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "task_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      canvases: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          nodes: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          nodes?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          nodes?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canvases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_nodes: {
        Row: {
          attached_files: Json | null
          background_color: string | null
          base_node_id: string | null
          drawing_data: string | null
          id: string
          tags: string[] | null
          text_color: string | null
          title: string | null
        }
        Insert: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          drawing_data?: string | null
          id?: string
          tags?: string[] | null
          text_color?: string | null
          title?: string | null
        }
        Update: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          drawing_data?: string | null
          id?: string
          tags?: string[] | null
          text_color?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draw_nodes_base_node_id_fkey"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_draw_nodes_base_node_id"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      edges: {
        Row: {
          canvas_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          source_node_id: string | null
          target_node_id: string | null
          updated_at: string | null
        }
        Insert: {
          canvas_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          source_node_id?: string | null
          target_node_id?: string | null
          updated_at?: string | null
        }
        Update: {
          canvas_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          source_node_id?: string | null
          target_node_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edges_canvas_id_fkey"
            columns: ["canvas_id"]
            isOneToOne: false
            referencedRelation: "canvases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          file_data: string | null
          file_type: string | null
          file_url: string | null
          id: number
          name: string
        }
        Insert: {
          file_data?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: number
          name: string
        }
        Update: {
          file_data?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      node_files: {
        Row: {
          file_id: number
          node_id: string
        }
        Insert: {
          file_id: number
          node_id: string
        }
        Update: {
          file_id?: number
          node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "node_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_files_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_tags: {
        Row: {
          node_id: string
          tag_id: number
        }
        Insert: {
          node_id: string
          tag_id: number
        }
        Update: {
          node_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "node_tags_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      node_types: {
        Row: {
          description: string | null
          icon_url: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          icon_url?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          icon_url?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      nodes: {
        Row: {
          base_node_id: string | null
          canvas_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          position: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          base_node_id?: string | null
          canvas_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          position?: Json | null
          type: string
          updated_at?: string | null
        }
        Update: {
          base_node_id?: string | null
          canvas_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          position?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nodes_base_node_id_fkey"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_canvas_id_fkey"
            columns: ["canvas_id"]
            isOneToOne: false
            referencedRelation: "canvases"
            referencedColumns: ["id"]
          },
        ]
      }
      note_nodes: {
        Row: {
          attached_files: Json | null
          background_color: string | null
          base_node_id: string | null
          content: string | null
          id: string
          tags: string[] | null
          text_color: string | null
          title: string | null
        }
        Insert: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          content?: string | null
          id?: string
          tags?: string[] | null
          text_color?: string | null
          title?: string | null
        }
        Update: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          content?: string | null
          id?: string
          tags?: string[] | null
          text_color?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_note_nodes_base_node_id"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_nodes_base_node_id_fkey"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          slug: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          slug?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          slug?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      table_nodes: {
        Row: {
          attached_files: Json | null
          background_color: string | null
          base_node_id: string | null
          columns: Json | null
          id: string
          rows: Json | null
          tags: string[] | null
          text_color: string | null
          title: string | null
        }
        Insert: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          columns?: Json | null
          id?: string
          rows?: Json | null
          tags?: string[] | null
          text_color?: string | null
          title?: string | null
        }
        Update: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          columns?: Json | null
          id?: string
          rows?: Json | null
          tags?: string[] | null
          text_color?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_table_nodes_base_node_id"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_nodes_base_node_id_fkey"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          color?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          color?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      task_nodes: {
        Row: {
          attached_files: Json | null
          background_color: string | null
          base_node_id: string | null
          id: string
          tags: string[] | null
          tasks: Json | null
          text_color: string | null
          title: string | null
        }
        Insert: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          id?: string
          tags?: string[] | null
          tasks?: Json | null
          text_color?: string | null
          title?: string | null
        }
        Update: {
          attached_files?: Json | null
          background_color?: string | null
          base_node_id?: string | null
          id?: string
          tags?: string[] | null
          tasks?: Json | null
          text_color?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_nodes_base_node_id"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_nodes_base_node_id_fkey"
            columns: ["base_node_id"]
            isOneToOne: false
            referencedRelation: "base_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      duplicate_canvas: {
        Args: {
          original_canvas_id: string
        }
        Returns: string
      }
    }
    Enums: {
      price_interval: "day" | "week" | "month" | "year"
      price_type: "one_time" | "recurring"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

