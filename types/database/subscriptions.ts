import { Json } from './common';
import { Database } from './databaseTypes';

export interface Subscriptions {
  Row: {
    cancel_at: string | null;
    cancel_at_period_end: boolean | null;
    canceled_at: string | null;
    created: string;
    current_period_end: string;
    current_period_start: string;
    ended_at: string | null;
    id: string;
    metadata: Json | null;
    price_id: string | null;
    quantity: number | null;
    status: Database['public']['Enums']['subscription_status'] | null;
    trial_end: string | null;
    trial_start: string | null;
    user_id: string;
  };
  Insert: {
    cancel_at?: string | null;
    cancel_at_period_end?: boolean | null;
    canceled_at?: string | null;
    created?: string;
    current_period_end?: string;
    current_period_start?: string;
    ended_at?: string | null;
    id: string;
    metadata?: Json | null;
    price_id?: string | null;
    quantity?: number | null;
    status?: Database['public']['Enums']['subscription_status'] | null;
    trial_end?: string | null;
    trial_start?: string | null;
    user_id: string;
  };
  Update: {
    cancel_at?: string | null;
    cancel_at_period_end?: boolean | null;
    canceled_at?: string | null;
    created?: string;
    current_period_end?: string;
    current_period_start?: string;
    ended_at?: string | null;
    id?: string;
    metadata?: Json | null;
    price_id?: string | null;
    quantity?: number | null;
    status?: Database['public']['Enums']['subscription_status'] | null;
    trial_end?: string | null;
    trial_start?: string | null;
    user_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: 'subscriptions_price_id_fkey';
      columns: ['price_id'];
      isOneToOne: false;
      referencedRelation: 'prices';
      referencedColumns: ['id'];
    },
    {
      foreignKeyName: 'subscriptions_user_id_fkey';
      columns: ['user_id'];
      isOneToOne: false;
      referencedRelation: 'users';
      referencedColumns: ['id'];
    }
  ];
}
