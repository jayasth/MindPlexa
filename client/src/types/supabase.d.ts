export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
        };
        Insert: {
          username: string;
          email: string;
        };
        Update: {
          username?: string;
          email?: string;
        };
      };
    };
    Views: {
      // Define if any
    };
    Functions: {
      // Define if any
    };
    Enums: {
      // Define if you use any enums in your database
    };
  };
}
