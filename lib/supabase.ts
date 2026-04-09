import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      audits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          status: string;
          total_monthly_cost: number;
          total_annual_cost: number;
          vendor_count: number;
          report_data: unknown;
        };
        Insert: Omit<Database['public']['Tables']['audits']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audits']['Insert']>;
      };
    };
  };
};
