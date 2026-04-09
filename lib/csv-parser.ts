import Papa from 'papaparse';
import { detectVendorInfo, buildCategoryBreakdown } from './saas-categories';
import type { Subscription, ParsedCSV } from '@/types';

// Normalize header names to canonical keys
function normalizeHeader(header: string): string {
  const h = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (['vendor', 'company', 'service', 'tool', 'name', 'software', 'app', 'product', 'subscription'].includes(h)) return 'vendor';
  if (['amount', 'cost', 'price', 'charge', 'fee', 'monthly', 'monthlycost', 'monthlyprice', 'monthlyamount'].includes(h)) return 'amount';
  if (['annual', 'yearly', 'annualcost', 'yearlycost', 'annualprice'].includes(h)) return 'annual';
  if (['users', 'seats', 'licenses', 'usercount', 'numusers'].includes(h)) return 'users';
  if (['cycle', 'billing', 'billingcycle', 'frequency', 'period'].includes(h)) return 'cycle';
  if (['category', 'type', 'dept', 'department'].includes(h)) return 'category';
  if (['description', 'notes', 'note', 'memo'].includes(h)) return 'description';
  return h;
}

function parseAmount(value: string): number {
  if (!value) return 0;
  // Strip currency symbols, commas, spaces
  const cleaned = value.replace(/[$€£,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.abs(parsed);
}

function parseBillingCycle(value: string): Subscription['billing_cycle'] {
  if (!value) return 'unknown';
  const v = value.toLowerCase().trim();
  if (v.includes('month')) return 'monthly';
  if (v.includes('year') || v.includes('annual')) return 'annual';
  if (v.includes('quarter')) return 'quarterly';
  return 'unknown';
}

function deriveMonthlyAndAnnual(
  amount: number,
  annual: number,
  cycle: Subscription['billing_cycle']
): { monthly: number; annual: number } {
  if (amount > 0 && annual > 0) return { monthly: amount, annual };
  if (amount > 0) {
    if (cycle === 'annual') return { monthly: amount / 12, annual: amount };
    if (cycle === 'quarterly') return { monthly: amount / 3, annual: amount * 4 };
    return { monthly: amount, annual: amount * 12 };
  }
  if (annual > 0) return { monthly: annual / 12, annual };
  return { monthly: 0, annual: 0 };
}

export function parseCSVText(csvText: string): ParsedCSV {
  const warnings: string[] = [];
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => normalizeHeader(h),
  });

  if (result.errors.length > 0) {
    warnings.push(`CSV parse warnings: ${result.errors.map((e) => e.message).join(', ')}`);
  }

  const rows = result.data;
  if (rows.length === 0) {
    return {
      subscriptions: [],
      category_breakdown: [],
      total_monthly_cost: 0,
      total_annual_cost: 0,
      vendor_count: 0,
      warnings: ['No data rows found in CSV.'],
    };
  }

  const subscriptions: Subscription[] = [];
  const seenVendors = new Set<string>();

  for (const row of rows) {
    const vendorRaw = row.vendor || row.name || row.description || '';
    if (!vendorRaw.trim()) {
      warnings.push('Skipped row with no vendor/name.');
      continue;
    }

    const vendor = vendorRaw.trim();
    const amount = parseAmount(row.amount || row.cost || row.price || row.charge || row.fee || '0');
    const annualAmt = parseAmount(row.annual || '0');
    const usersRaw = parseInt(row.users || row.seats || '1', 10);
    const users = isNaN(usersRaw) || usersRaw < 1 ? 1 : usersRaw;
    const cycle = parseBillingCycle(row.cycle || row.billing || '');

    const { monthly, annual } = deriveMonthlyAndAnnual(amount, annualAmt, cycle);

    if (monthly === 0 && annual === 0) {
      warnings.push(`Skipped "${vendor}": no cost data found.`);
      continue;
    }

    const vendorInfo = row.category
      ? { category: row.category.trim(), displayName: vendor }
      : detectVendorInfo(vendor);

    const vendorKey = vendor.toLowerCase();
    if (seenVendors.has(vendorKey)) {
      warnings.push(`Duplicate vendor "${vendor}" merged.`);
      const existing = subscriptions.find((s) => s.vendor.toLowerCase() === vendorKey);
      if (existing) {
        existing.monthly_cost += monthly;
        existing.annual_cost += annual;
        existing.users_count += users;
        continue;
      }
    }
    seenVendors.add(vendorKey);

    subscriptions.push({
      vendor: vendorInfo.displayName || vendor,
      category: vendorInfo.category,
      monthly_cost: Math.round(monthly * 100) / 100,
      annual_cost: Math.round(annual * 100) / 100,
      users_count: users,
      billing_cycle: cycle,
      raw_row: row,
    });
  }

  const category_breakdown = buildCategoryBreakdown(subscriptions);
  const total_monthly_cost = subscriptions.reduce((sum, s) => sum + s.monthly_cost, 0);
  const total_annual_cost = subscriptions.reduce((sum, s) => sum + s.annual_cost, 0);

  return {
    subscriptions,
    category_breakdown,
    total_monthly_cost: Math.round(total_monthly_cost * 100) / 100,
    total_annual_cost: Math.round(total_annual_cost * 100) / 100,
    vendor_count: subscriptions.length,
    warnings,
  };
}
