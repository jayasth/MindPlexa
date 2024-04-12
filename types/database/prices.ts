import { Database } from './databaseTypes';

export interface Prices {
  Row: {
    active: boolean | null;
    currency: string | null;
    id: string;
    interval: Database['public']['Enums']['pricing_plan_interval'] | null;
    interval_count: number | null;
    product_id: string | null;
    trial_period_days: number | null;
    type: Database['public']['Enums']['pricing_type'] | null;
    unit_amount: number | null;
  };
  Insert: {
    active?: boolean | null;
    currency?: string | null;
    id: string;
    interval?: Database['public']['Enums']['pricing_plan_interval'] | null;
    interval_count?: number | null;
    product_id?: string | null;
    trial_period_days?: number | null;
    type?: Database['public']['Enums']['pricing_type'] | null;
    unit_amount?: number | null;
  };
  Update: {
    active?: boolean | null;
    currency?: string | null;
    id?: string;
    interval?: Database['public']['Enums']['pricing_plan_interval'] | null;
    interval_count?: number | null;
    product_id?: string | null;
    trial_period_days?: number | null;
    type?: Database['public']['Enums']['pricing_type'] | null;
    unit_amount?: number | null;
  };
  Relationships: [
    {
      foreignKeyName: 'prices_product_id_fkey';
      columns: ['product_id'];
      isOneToOne: false;
      referencedRelation: 'products';
      referencedColumns: ['id'];
    }
  ];
}
