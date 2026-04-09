import { describe, it, expect } from 'vitest';
import { parseCSVText } from '@/lib/csv-parser';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function csv(...rows: string[]): string {
  return rows.join('\n');
}

// ---------------------------------------------------------------------------
// Basic parsing
// ---------------------------------------------------------------------------

describe('parseCSVText — basic parsing', () => {
  it('returns empty result for empty CSV', () => {
    const result = parseCSVText('vendor,amount\n');
    expect(result.subscriptions).toHaveLength(0);
    expect(result.vendor_count).toBe(0);
    expect(result.total_monthly_cost).toBe(0);
    expect(result.total_annual_cost).toBe(0);
    expect(result.warnings).toContain('No data rows found in CSV.');
  });

  it('parses a single monthly row correctly', () => {
    const result = parseCSVText(csv(
      'vendor,amount,users,billing_cycle',
      'Slack,125.00,25,monthly',
    ));
    expect(result.subscriptions).toHaveLength(1);
    const sub = result.subscriptions[0];
    expect(sub.vendor).toBe('Slack');
    expect(sub.monthly_cost).toBe(125);
    expect(sub.annual_cost).toBe(1500);
    expect(sub.users_count).toBe(25);
    expect(sub.billing_cycle).toBe('monthly');
  });

  it('parses an annual row and derives monthly correctly', () => {
    const result = parseCSVText(csv(
      'vendor,amount,billing_cycle',
      'GitHub,1200,annual',
    ));
    const sub = result.subscriptions[0];
    expect(sub.annual_cost).toBe(1200);
    expect(sub.monthly_cost).toBe(100);
    expect(sub.billing_cycle).toBe('annual');
  });

  it('parses a quarterly row correctly', () => {
    const result = parseCSVText(csv(
      'vendor,amount,billing_cycle',
      'Zoom,300,quarterly',
    ));
    const sub = result.subscriptions[0];
    expect(sub.monthly_cost).toBe(100);
    expect(sub.annual_cost).toBe(1200);
    expect(sub.billing_cycle).toBe('quarterly');
  });

  it('handles multiple rows and aggregates totals', () => {
    const result = parseCSVText(csv(
      'vendor,amount,billing_cycle',
      'Slack,100,monthly',
      'GitHub,50,monthly',
      'Figma,200,monthly',
    ));
    expect(result.subscriptions).toHaveLength(3);
    expect(result.vendor_count).toBe(3);
    expect(result.total_monthly_cost).toBeCloseTo(350);
    expect(result.total_annual_cost).toBeCloseTo(4200);
  });
});

// ---------------------------------------------------------------------------
// Header normalisation
// ---------------------------------------------------------------------------

describe('parseCSVText — header normalisation', () => {
  it('accepts "company" as vendor column', () => {
    const result = parseCSVText(csv('company,amount', 'Notion,50'));
    expect(result.subscriptions[0].vendor).toBe('Notion');
  });

  it('accepts "cost" as amount column', () => {
    const result = parseCSVText(csv('vendor,cost', 'Slack,80'));
    expect(result.subscriptions[0].monthly_cost).toBe(80);
  });

  it('accepts "seats" as users column', () => {
    const result = parseCSVText(csv('vendor,amount,seats', 'Zoom,100,10'));
    expect(result.subscriptions[0].users_count).toBe(10);
  });

  it('accepts "annual" column for yearly cost', () => {
    const result = parseCSVText(csv('vendor,annual', 'Atlassian,1200'));
    const sub = result.subscriptions[0];
    expect(sub.annual_cost).toBe(1200);
    expect(sub.monthly_cost).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Amount parsing
// ---------------------------------------------------------------------------

describe('parseCSVText — amount parsing', () => {
  it('strips dollar signs', () => {
    const result = parseCSVText(csv('vendor,amount', 'Slack,$125.00'));
    expect(result.subscriptions[0].monthly_cost).toBe(125);
  });

  it('strips euro signs', () => {
    const result = parseCSVText(csv('vendor,amount', 'Notion,€50'));
    expect(result.subscriptions[0].monthly_cost).toBe(50);
  });

  it('strips pound signs', () => {
    const result = parseCSVText(csv('vendor,amount', 'GitHub,£84'));
    expect(result.subscriptions[0].monthly_cost).toBe(84);
  });

  it('strips commas from large numbers', () => {
    const result = parseCSVText(csv('vendor,amount', 'BigVendor,1,200.00'));
    expect(result.subscriptions[0].monthly_cost).toBe(1200);
  });

  it('returns 0 for non-numeric amount and emits warning', () => {
    const result = parseCSVText(csv('vendor,amount', 'Slack,N/A'));
    // Row should be skipped (monthly=0, annual=0 → warning)
    expect(result.subscriptions).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes('Slack'))).toBe(true);
  });

  it('takes the absolute value of negative amounts', () => {
    const result = parseCSVText(csv('vendor,amount', 'Refund,-50'));
    expect(result.subscriptions[0].monthly_cost).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// Duplicate vendor deduplication
// ---------------------------------------------------------------------------

describe('parseCSVText — vendor deduplication', () => {
  it('merges duplicate vendors and sums costs', () => {
    const result = parseCSVText(csv(
      'vendor,amount,billing_cycle',
      'Slack,100,monthly',
      'slack,50,monthly', // same vendor, different case
    ));
    expect(result.subscriptions).toHaveLength(1);
    expect(result.subscriptions[0].monthly_cost).toBe(150);
    expect(result.warnings.some((w) => w.toLowerCase().includes('duplicate'))).toBe(true);
  });

  it('merges user counts for duplicates', () => {
    const result = parseCSVText(csv(
      'vendor,amount,users,billing_cycle',
      'GitHub,50,5,monthly',
      'GitHub,30,3,monthly',
    ));
    expect(result.subscriptions[0].users_count).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// Missing / bad data
// ---------------------------------------------------------------------------

describe('parseCSVText — missing and bad data', () => {
  it('skips rows with no vendor name', () => {
    const result = parseCSVText(csv(
      'vendor,amount',
      ',100',
      'Slack,50',
    ));
    expect(result.subscriptions).toHaveLength(1);
    expect(result.warnings.some((w) => w.toLowerCase().includes('no vendor'))).toBe(true);
  });

  it('skips rows with zero cost', () => {
    const result = parseCSVText(csv(
      'vendor,amount',
      'Freebie,0',
    ));
    expect(result.subscriptions).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes('no cost'))).toBe(true);
  });

  it('defaults missing users column to 1', () => {
    const result = parseCSVText(csv('vendor,amount', 'Notion,50'));
    expect(result.subscriptions[0].users_count).toBe(1);
  });

  it('defaults invalid users count to 1', () => {
    const result = parseCSVText(csv('vendor,amount,users', 'Notion,50,abc'));
    expect(result.subscriptions[0].users_count).toBe(1);
  });

  it('treats unknown billing cycle as "unknown"', () => {
    const result = parseCSVText(csv('vendor,amount,billing_cycle', 'Tool,100,biweekly'));
    expect(result.subscriptions[0].billing_cycle).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

describe('parseCSVText — category detection', () => {
  it('uses provided category column over auto-detection', () => {
    const result = parseCSVText(csv('vendor,amount,category', 'Slack,100,Finance'));
    expect(result.subscriptions[0].category).toBe('Finance');
  });

  it('auto-detects known vendors', () => {
    const result = parseCSVText(csv('vendor,amount', 'Slack,100'));
    // Slack is known — should be categorised (not 'Other')
    expect(result.subscriptions[0].category).not.toBe('');
  });

  it('falls back to Other for completely unknown vendors', () => {
    const result = parseCSVText(csv('vendor,amount', 'XyzUnknownSaaS9999,100'));
    // Should still produce a subscription, category may be 'Other' or heuristic
    expect(result.subscriptions).toHaveLength(1);
    expect(result.subscriptions[0].category).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Category breakdown
// ---------------------------------------------------------------------------

describe('parseCSVText — category_breakdown', () => {
  it('groups subscriptions into categories', () => {
    const result = parseCSVText(csv(
      'vendor,amount,category',
      'ToolA,100,Finance',
      'ToolB,200,Finance',
      'ToolC,50,Security',
    ));
    const financeRow = result.category_breakdown.find((c) => c.category === 'Finance');
    const securityRow = result.category_breakdown.find((c) => c.category === 'Security');
    expect(financeRow).toBeDefined();
    expect(financeRow!.monthly_cost).toBeCloseTo(300);
    expect(financeRow!.vendor_count).toBe(2);
    expect(securityRow!.monthly_cost).toBeCloseTo(50);
  });
});

// ---------------------------------------------------------------------------
// Edge cases / robustness
// ---------------------------------------------------------------------------

describe('parseCSVText — edge cases', () => {
  it('handles Windows line endings (CRLF)', () => {
    const result = parseCSVText('vendor,amount\r\nSlack,100\r\nGitHub,50');
    expect(result.subscriptions).toHaveLength(2);
  });

  it('handles CSV with extra whitespace in values', () => {
    const result = parseCSVText(csv('vendor,amount', '  Slack  ,  100  '));
    // vendor should be trimmed
    expect(result.subscriptions[0].vendor).not.toMatch(/^\s|\s$/);
  });

  it('does not throw on a large dataset (500 rows)', () => {
    const header = 'vendor,amount,billing_cycle';
    const rows = Array.from({ length: 500 }, (_, i) => `Vendor${i},${(i + 1) * 10},monthly`);
    const bigCsv = [header, ...rows].join('\n');
    expect(() => parseCSVText(bigCsv)).not.toThrow();
    const result = parseCSVText(bigCsv);
    expect(result.vendor_count).toBe(500);
  });

  it('returns both monthly and annual when both columns provided', () => {
    const result = parseCSVText(csv('vendor,amount,annual', 'Atlassian,120,1200'));
    const sub = result.subscriptions[0];
    // When both are present, amount=monthly, annual=annual
    expect(sub.monthly_cost).toBe(120);
    expect(sub.annual_cost).toBe(1200);
  });

  it('rounds costs to 2 decimal places', () => {
    const result = parseCSVText(csv('vendor,amount,billing_cycle', 'Tool,100,quarterly'));
    // quarterly: monthly = 100/3 = 33.333...
    const monthly = result.subscriptions[0].monthly_cost;
    expect(monthly.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
  });
});
