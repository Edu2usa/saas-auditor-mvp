export interface Subscription {
  id?: string;
  vendor: string;
  category: string;
  monthly_cost: number;
  annual_cost: number;
  users_count: number;
  billing_cycle: 'monthly' | 'annual' | 'quarterly' | 'unknown';
  raw_row?: Record<string, string>;
}

export interface Audit {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  status: 'pending' | 'complete' | 'error';
  total_monthly_cost: number;
  total_annual_cost: number;
  vendor_count: number;
  subscriptions: Subscription[];
  category_breakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  monthly_cost: number;
  annual_cost: number;
  vendor_count: number;
  color: string;
}

export interface ParsedCSV {
  subscriptions: Subscription[];
  category_breakdown: CategoryBreakdown[];
  total_monthly_cost: number;
  total_annual_cost: number;
  vendor_count: number;
  warnings: string[];
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}
