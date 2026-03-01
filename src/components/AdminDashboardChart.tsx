'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface AdminDashboardChartProps {
  gelir: number
  gider: number
}

export function AdminDashboardChart({ gelir, gider }: AdminDashboardChartProps) {
  const data = [
    { name: 'Gelir', value: gelir, fill: '#00a65a' },
    { name: 'Gider', value: gider, fill: '#dd4b39' },
  ]

  if (gelir === 0 && gider === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[#555]">Henüz veri yok. Fatura ve gider ekledikçe grafik güncellenecek.</div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e6f0" />
          <XAxis dataKey="name" stroke="#777" fontSize={12} />
          <YAxis stroke="#777" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e3e6f0', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            labelStyle={{ color: '#333' }}
            formatter={(value) => [`${Number(value ?? 0).toLocaleString('tr-TR')} ₺`, 'Tutar']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={120}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
