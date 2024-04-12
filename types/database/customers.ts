export interface Customers {
  Row: {
    id: string;
    stripe_customer_id: string | null;
  };
  Insert: {
    id: string;
    stripe_customer_id?: string | null;
  };
  Update: {
    id?: string;
    stripe_customer_id?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: 'customers_id_fkey';
      columns: ['id'];
      isOneToOne: true;
      referencedRelation: 'users';
      referencedColumns: ['id'];
    }
  ];
}
