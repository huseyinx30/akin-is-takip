'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, Pencil, Trash2 } from 'lucide-react'

const statusLabels: Record<string, string> = {
  kesildi: 'Kesildi',
  odendi: 'Ödendi',
  beklemede: 'Beklemede',
}

interface FaturaDetayClientProps {
  invoice: {
    id: string
    company_id: string
    invoice_no: string
    invoice_date: string
    total_amount: number
    currency: string
    status: string
    notes?: string | null
    companies?: { name: string } | null
  }
  companies: { id: string; name: string }[]
}

export function FaturaDetayClient({ invoice, companies }: FaturaDetayClientProps) {
  const searchParams = useSearchParams()
  const [editMode, setEditMode] = useState(searchParams.get('edit') === '1')
  const [form, setForm] = useState({
    company_id: invoice.company_id,
    invoice_no: invoice.invoice_no,
    invoice_date: invoice.invoice_date,
    total_amount: invoice.total_amount.toString(),
    currency: invoice.currency,
    status: invoice.status,
    notes: invoice.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/faturalar/${invoice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        total_amount: parseFloat(form.total_amount),
        notes: form.notes || null,
      }),
    })
    setLoading(false)
    if (res.ok) {
      setEditMode(false)
      router.refresh()
    } else {
      const d = await res.json()
      alert(d.error || 'Güncelleme başarısız')
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch(`/api/faturalar/${invoice.id}`, { method: 'DELETE' })
    setLoading(false)
    setShowDeleteConfirm(false)
    if (res.ok) {
      router.push('/dashboard/faturalar')
      router.refresh()
    } else {
      const d = await res.json()
      alert(d.error || 'Silme başarısız')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Fatura Detayı</h1>
        <div className="flex items-center gap-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white text-sm font-medium"
              >
                <Pencil className="w-4 h-4" />
                Düzenle
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#dd4b39]/10 hover:bg-[#dd4b39]/20 text-[#dd4b39] text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setEditMode(false); setForm({ company_id: invoice.company_id, invoice_no: invoice.invoice_no, invoice_date: invoice.invoice_date, total_amount: invoice.total_amount.toString(), currency: invoice.currency, status: invoice.status, notes: invoice.notes || '' }) }}
                className="px-3 py-1.5 rounded-lg border border-[#d2d6de] text-[#555] hover:bg-[#f8f9fc] text-sm font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                form="fatura-edit-form"
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-[#00a65a] hover:bg-[#008d4c] text-white text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          )}
        </div>
      </div>

      {editMode ? (
        <form id="fatura-edit-form" onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Firma *</label>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Fatura No *</label>
              <input type="text" value={form.invoice_no} onChange={(e) => setForm({ ...form, invoice_no: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tarih *</label>
              <input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tutar *</label>
              <input type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Para Birimi</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Durum</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
              <option value="kesildi">Kesildi</option>
              <option value="odendi">Ödendi</option>
              <option value="beklemede">Beklemede</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Notlar</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none" />
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><dt className="text-sm text-[#555]">Firma</dt><dd className="font-medium text-[#333]">{invoice.companies?.name || '-'}</dd></div>
          <div><dt className="text-sm text-[#555]">Fatura No</dt><dd className="font-medium text-[#333]">{invoice.invoice_no}</dd></div>
          <div><dt className="text-sm text-[#555]">Tarih</dt><dd className="font-medium text-[#333]">{invoice.invoice_date}</dd></div>
          <div><dt className="text-sm text-[#555]">Tutar</dt><dd className="font-medium text-[#333]">{Number(invoice.total_amount).toLocaleString('tr-TR')} {invoice.currency}</dd></div>
          <div><dt className="text-sm text-[#555]">Durum</dt><dd><span className={`px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'odendi' ? 'bg-[#00a65a]/20 text-[#00a65a]' : 'bg-[#f39c12]/20 text-[#f39c12]'}`}>{statusLabels[invoice.status] || invoice.status}</span></dd></div>
          {invoice.notes && <div className="sm:col-span-2"><dt className="text-sm text-[#555]">Notlar</dt><dd className="font-medium text-[#333] whitespace-pre-wrap">{invoice.notes}</dd></div>}
        </dl>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#333] mb-2">Faturayı Sil</h3>
            <p className="text-[#555] text-sm mb-4">Bu faturayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={loading} className="px-4 py-2 rounded-lg border border-[#d2d6de] text-[#555] hover:bg-[#f8f9fc] font-medium disabled:opacity-50">İptal</button>
              <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-lg bg-[#dd4b39] hover:bg-[#c23321] text-white font-medium disabled:opacity-50">{loading ? 'Siliniyor...' : 'Evet, Sil'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
