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
      calendar_nodes: {
        Row: {
          default_view: string | null
          events: Json | null
          id: string
          node_id: string | null
          time_zone: string | null
        }
        Insert: {
          default_view?: string | null
          events?: Json | null
          id?: string
          node_id?: string | null
          time_zone?: string | null
        }
        Update: {
          default_view?: string | null
          events?: Json | null
          id?: string
          node_id?: string | null
          time_zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_nodes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: true
            referencedRelation: "nodes"
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
          current_tool: string | null
          drawing_file_url: string | null
          id: string
          layers: Json | null
          node_id: string | null
          settings: Json | null
        }
        Insert: {
          current_tool?: string | null
          drawing_file_url?: string | null
          id?: string
          layers?: Json | null
          node_id?: string | null
          settings?: Json | null
        }
        Update: {
          current_tool?: string | null
          drawing_file_url?: string | null
          id?: string
          layers?: Json | null
          node_id?: string | null
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "draw_nodes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: true
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      edges: {
        Row: {
          canvas_id: string | null
          created_at: string | null
          id: string
          source_node_id: string | null
          target_node_id: string | null
          updated_at: string | null
        }
        Insert: {
          canvas_id?: string | null
          created_at?: string | null
          id?: string
          source_node_id?: string | null
          target_node_id?: string | null
          updated_at?: string | null
        }
        Update: {
          canvas_id?: string | null
          created_at?: string | null
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
      node_attachments: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: number | null
          id: string
          is_file: boolean | null
          mime_type: string | null
          node_id: string
          storage_path: string | null
          type: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_file?: boolean | null
          mime_type?: string | null
          node_id: string
          storage_path?: string | null
          type: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_file?: boolean | null
          mime_type?: string | null
          node_id?: string
          storage_path?: string | null
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "node_attachments_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_canvas_link: {
        Row: {
          canvas_id: string
          node_id: string
        }
        Insert: {
          canvas_id: string
          node_id: string
        }
        Update: {
          canvas_id?: string
          node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "node_canvas_link_canvas_id_fkey"
            columns: ["canvas_id"]
            isOneToOne: false
            referencedRelation: "canvases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_canvas_link_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_history: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          node_id: string
          version: number
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          node_id: string
          version: number
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          node_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "node_history_node_id_fkey"
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
          tag: string
        }
        Insert: {
          node_id: string
          tag: string
        }
        Update: {
          node_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "node_tags_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          background_color: string | null
          created_at: string | null
          edit_height: number | null
          edit_width: number | null
          id: string
          is_editing: boolean | null
          is_temporary: boolean | null
          mobile_edit_height: number | null
          mobile_edit_width: number | null
          parent_node_id: string | null
          position: Json | null
          text_color: string | null
          title: string | null
          type: Database["public"]["Enums"]["node_type"] | null
          updated_at: string | null
          version: number
          view_height: number | null
          view_width: number | null
          z_index: number | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          edit_height?: number | null
          edit_width?: number | null
          id?: string
          is_editing?: boolean | null
          is_temporary?: boolean | null
          mobile_edit_height?: number | null
          mobile_edit_width?: number | null
          parent_node_id?: string | null
          position?: Json | null
          text_color?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["node_type"] | null
          updated_at?: string | null
          version?: number
          view_height?: number | null
          view_width?: number | null
          z_index?: number | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          edit_height?: number | null
          edit_width?: number | null
          id?: string
          is_editing?: boolean | null
          is_temporary?: boolean | null
          mobile_edit_height?: number | null
          mobile_edit_width?: number | null
          parent_node_id?: string | null
          position?: Json | null
          text_color?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["node_type"] | null
          updated_at?: string | null
          version?: number
          view_height?: number | null
          view_width?: number | null
          z_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nodes_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_nodes: {
        Row: {
          content: string | null
          id: string
          node_id: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          node_id?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          node_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "note_nodes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: true
            referencedRelation: "nodes"
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
          columns: Json | null
          default_column_type: string | null
          default_locale: string | null
          id: string
          node_id: string | null
          rows: Json | null
        }
        Insert: {
          columns?: Json | null
          default_column_type?: string | null
          default_locale?: string | null
          id?: string
          node_id?: string | null
          rows?: Json | null
        }
        Update: {
          columns?: Json | null
          default_column_type?: string | null
          default_locale?: string | null
          id?: string
          node_id?: string | null
          rows?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "table_nodes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: true
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      task_nodes: {
        Row: {
          completed_tasks: number | null
          created_at: string | null
          id: string
          node_id: string | null
          show_completed_tasks: boolean | null
          show_due_date: boolean | null
          show_priority: boolean | null
          sort_by: string | null
          tasks: Json | null
          total_tasks: number | null
          updated_at: string | null
        }
        Insert: {
          completed_tasks?: number | null
          created_at?: string | null
          id?: string
          node_id?: string | null
          show_completed_tasks?: boolean | null
          show_due_date?: boolean | null
          show_priority?: boolean | null
          sort_by?: string | null
          tasks?: Json | null
          total_tasks?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_tasks?: number | null
          created_at?: string | null
          id?: string
          node_id?: string | null
          show_completed_tasks?: boolean | null
          show_due_date?: boolean | null
          show_priority?: boolean | null
          sort_by?: string | null
          tasks?: Json | null
          total_tasks?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_nodes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
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
      node_type:
        | "note"
        | "task"
        | "table"
        | "calendar"
        | "draw"
        | "selection_menu"
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

