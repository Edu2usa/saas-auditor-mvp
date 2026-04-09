import type { Audit } from '@/types';
import { TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';

interface Props { audit: Audit }

export default function CostSummary({ audit }: Props) {
  const topCategory = audit.category_breakdown[0];

  const stats = [
    {
      label: 'Monthly Spend',
      value: `$${audit.total_monthly_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
      sub: 'across all vendors',
    },
    {
      label: 'Annual Spend',
      value: `$${audit.total_annual_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <Calendar className="h-5 w-5 text-indigo-600" />,
      bg: 'bg-indigo-50',
      sub: 'projected 12 months',
    },
    {
      label: 'Total Vendors',
      value: String(audit.vendor_count),
      icon: <Package className="h-5 w-5 text-violet-600" />,
      bg: 'bg-violet-50',
      sub: `${audit.category_breakdown.length} categories`,
    },
    {
      label: 'Largest Category',
      value: topCategory?.category ?? '—',
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      sub: topCategory ? `$${topCategory.monthly_cost.toFixed(0)}/mo` : 'none',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-4">
          <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>{s.icon}</div>
          <p className="text-2xl font-bold text-gray-900 leading-tight truncate">{s.value}</p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</p>
          <p className="text-xs text-gray-400">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
