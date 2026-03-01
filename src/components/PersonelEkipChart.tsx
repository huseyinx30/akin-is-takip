'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface PersonelEkipChartProps {
  onaylananHarcama: number
  toplamOdeme: number
}

export function PersonelEkipChart({ onaylananHarcama, toplamOdeme }: PersonelEkipChartProps) {
  const data = [
    { name: 'Onaylanan Harcama', value: onaylananHarcama, fill: '#dd4b39' },
    { name: 'Alınan Ödeme', value: toplamOdeme, fill: '#00a65a' },
  ]

  if (onaylananHarcama === 0 && toplamOdeme === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-[#555] text-sm">
        Henüz veri yok. Harcama ve ödeme ekledikçe grafik güncellenecek.
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e6f0" />
          <XAxis dataKey="name" stroke="#777" fontSize={11} tick={{ fill: '#555' }} />
          <YAxis stroke="#777" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fill: '#555' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e3e6f0', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            formatter={(value: number | undefined) => [`${Number(value ?? 0).toLocaleString('tr-TR')} ₺`, 'Tutar']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
