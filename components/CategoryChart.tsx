import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategoryBreakdown } from '@/types';

interface Props { breakdown: CategoryBreakdown[] }

export default function CategoryChart({ breakdown }: Props) {
  if (!breakdown.length) return null;

  const data = breakdown.map((b) => ({
    name: b.category,
    value: b.monthly_cost,
    color: b.color,
  }));

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Monthly Spend Distribution</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Monthly']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
