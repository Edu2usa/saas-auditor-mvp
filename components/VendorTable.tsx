import { useState } from 'react';
import type { Subscription } from '@/types';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/saas-categories';
import clsx from 'clsx';

interface Props {
  subscriptions: Subscription[];
  totalMonthly: number;
}

type SortKey = 'vendor' | 'category' | 'monthly_cost' | 'annual_cost' | 'users_count';

export default function VendorTable({ subscriptions, totalMonthly }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('monthly_cost');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = subscriptions
    .filter((s) =>
      s.vendor.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(false); }
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="ml-1 inline-flex flex-col -space-y-1">
      <ChevronUp className={clsx('h-2.5 w-2.5', sortKey === k && sortAsc ? 'text-blue-600' : 'text-gray-300')} />
      <ChevronDown className={clsx('h-2.5 w-2.5', sortKey === k && !sortAsc ? 'text-blue-600' : 'text-gray-300')} />
    </span>
  );

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-semibold text-gray-800 text-sm">
          All Subscriptions <span className="text-gray-400 font-normal">({filtered.length})</span>
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              {([
                { key: 'vendor', label: 'Vendor' },
                { key: 'category', label: 'Category' },
                { key: 'users_count', label: 'Users' },
                { key: 'monthly_cost', label: 'Monthly' },
                { key: 'annual_cost', label: 'Annual' },
              ] as { key: SortKey; label: string }[]).map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={clsx(
                    'px-4 py-3 text-left cursor-pointer hover:text-gray-700 select-none whitespace-nowrap',
                    col.key === 'monthly_cost' || col.key === 'annual_cost' ? 'text-right' : ''
                  )}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortIcon k={col.key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((sub, i) => {
              const pct = totalMonthly > 0 ? (sub.monthly_cost / totalMonthly) * 100 : 0;
              const color = CATEGORY_COLORS[sub.category] ?? CATEGORY_COLORS['Other'];
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{sub.vendor}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {sub.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{sub.users_count}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">
                    ${sub.monthly_cost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">
                    ${sub.annual_cost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-700">
              <tr>
                <td className="px-4 py-3" colSpan={3}>Total</td>
                <td className="px-4 py-3 text-right font-mono">
                  ${filtered.reduce((s, r) => s + r.monthly_cost, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  ${filtered.reduce((s, r) => s + r.annual_cost, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          )}
        </table>

        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">No vendors match your search.</p>
        )}
      </div>
    </div>
  );
}
