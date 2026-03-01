'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, X, ExternalLink } from 'lucide-react'

interface ExpenseItem {
  id: string
  description: string
  amount: number
  expense_date: string
  category?: string
  type: 'personnel' | 'team'
  detayUrl: string
  profile?: { full_name: string }
}

interface OnayBekleyenHarcamalarListeProps {
  expenses: ExpenseItem[]
}

export function OnayBekleyenHarcamalarListe({ expenses }: OnayBekleyenHarcamalarListeProps) {
  const [list, setList] = useState(expenses)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleAction = async (id: string, type: 'personnel' | 'team', action: 'onayla' | 'reddet') => {
    setLoading(id)
    const res = await fetch('/api/harcama-onay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, action }),
    })
    setLoading(null)
    if (res.ok) {
      setList((prev) => prev.filter((e) => e.id !== id))
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'İşlem başarısız')
    }
  }

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-12 text-center text-[#555]">
        Onay bekleyen harcama bulunmuyor.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fc] border-b border-[#e3e6f0]">
              <th className="text-left p-4 text-[#333] font-semibold">Açıklama</th>
              <th className="text-left p-4 text-[#333] font-semibold">Kişi / Ekip</th>
              <th className="text-left p-4 text-[#333] font-semibold">Tarih</th>
              <th className="text-left p-4 text-[#333] font-semibold">Tutar</th>
              <th className="text-left p-4 text-[#333] font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={`${e.type}-${e.id}`} className="border-b border-[#e3e6f0] hover:bg-[#f8f9fc]">
                <td className="p-4">
                  <p className="font-medium text-[#333]">{e.description}</p>
                  {e.category && <p className="text-xs text-[#555]">{e.category}</p>}
                </td>
                <td className="p-4 text-[#555]">
                  {e.profile?.full_name || '-'}
                  <span className="ml-1 text-xs">{e.type === 'personnel' ? '(Personel)' : '(Ekip)'}</span>
                </td>
                <td className="p-4 text-[#555]">{e.expense_date}</td>
                <td className="p-4 font-semibold text-[#dd4b39]">{Number(e.amount).toLocaleString('tr-TR')} ₺</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(e.id, e.type, 'onayla')}
                      disabled={loading === e.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#00a65a] hover:bg-[#008d4c] text-white text-sm font-medium disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Onayla
                    </button>
                    <button
                      onClick={() => handleAction(e.id, e.type, 'reddet')}
                      disabled={loading === e.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#dd4b39] hover:bg-[#c23321] text-white text-sm font-medium disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reddet
                    </button>
                    <Link
                      href={e.detayUrl}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#3c8dbc] hover:bg-[#367fa9] text-white text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" /> Detay
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
