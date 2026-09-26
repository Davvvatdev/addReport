'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function StatsChart({ data }: { data: { name: string; count: number }[] }) {
  const colors = ['#f59e0b', '#2563eb', '#10b981', '#e11d48', '#0284c7', '#0d9488', '#64748b'];

  return (
    <div className="mt-4 h-72 w-full select-none" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#475569', fontWeight: 600, fontFamily: 'var(--font-vazirmatn)' }} 
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
            contentStyle={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontFamily: 'var(--font-vazirmatn)',
              textAlign: 'right',
              padding: '8px 12px',
            }}
            formatter={(value) => [`${Number(value).toLocaleString('fa-IR')} گزارش`, 'تعداد']}
            labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}
          />
          <Bar dataKey="count" radius={[8, 8, 2, 2]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
