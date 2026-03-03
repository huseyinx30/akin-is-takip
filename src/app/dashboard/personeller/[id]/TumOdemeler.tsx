'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wallet, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const paymentTypeLabels: Record<string, string> = {
  avans: 'Avans',
  maas: 'Maaş',
  hakedis: 'Hakediş',
  harcama: 'Harcama',
  diger: 'Diğer',
}

export function TumOdemeler({ personelId }: { personelId: string }) {
  const [payments, setPayments] = useState<any[]>([])
  const [showAll, setShowAll] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('personnel_payments')
      .select('*')
      .eq('personel_id', personelId)
      .order('payment_date', { ascending: false })
      .then(({ data }) => setPayments(data || []))
  }, [personelId])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ödemeyi silmek istediğinize emin misiniz?')) return
    setDeleting(id)
    const res = await fetch(`/api/personnel-payments/${id}`, { method: 'DELETE' })
    setDeleting(null)
    if (!res.ok) return
    setPayments((prev) => prev.filter((p) => p.id !== id))
    window.location.reload()
  }

  const displayList = showAll ? payments : payments.slice(0, 5)
  const hasMore = payments.length > 5

  return (
    <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#333] flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Tüm Ödemeler
        </h2>
      </div>
      <div className="space-y-2">
        {displayList.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center p-3 bg-[#f8f9fc] rounded-lg border border-[#e3e6f0] group"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[#555] block">{p.payment_date}</span>
              <span className="text-[#333] text-sm">
                {paymentTypeLabels[p.payment_type] || p.payment_type}
                {p.description && ` • ${p.description}`}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[#00a65a] font-medium">{Number(p.amount).toLocaleString('tr-TR')} ₺</span>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deleting === p.id}
                className="p-1.5 rounded text-[#dd4b39] hover:bg-[#dd4b39]/10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title="Ödemeyi sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-[#3c8dbc] hover:bg-[#3c8dbc]/5 rounded-lg font-medium text-sm"
        >
          {showAll ? (
            <>Daha az göster <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Tümünü göster ({payments.length} ödeme) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
      {payments.length === 0 && (
        <p className="text-[#555] text-center py-8">Henüz ödeme kaydı yok.</p>
      )}
    </div>
  )
}
