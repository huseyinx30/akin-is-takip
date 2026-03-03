'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

interface HakedisDetayClientProps {
  payment: {
    id: string
    invoice_id: string | null
    project_id: string | null
    amount: number
    payment_date: string
    description: string | null
    invoices?: { invoice_no: string; total_amount: number; companies?: { name: string } } | null
    projects?: { name: string; companies?: { name: string } } | null
  }
  companies: { id: string; name: string }[]
  invoices: { id: string; invoice_no: string; invoice_date: string; total_amount: number }[]
}

export function HakedisDetayClient({ payment, companies, invoices: initialInvoices }: HakedisDetayClientProps) {
  const searchParams = useSearchParams()
  const [editMode, setEditMode] = useState(searchParams.get('edit') === '1')
  const [form, setForm] = useState({
    company_id: '',
    invoice_id: payment.invoice_id || '',
    amount: payment.amount.toString(),
    payment_date: payment.payment_date,
    description: payment.description || '',
  })
  const [invoices, setInvoices] = useState(initialInvoices)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const invData = payment.invoices as { company_id?: string } | null
  const initialCompanyId = invData?.company_id || ''

  useEffect(() => {
    if (!form.company_id) {
      setInvoices([])
      setForm((f) => ({ ...f, invoice_id: '' }))
      return
    }
    supabase.from('invoices').select('id, invoice_no, invoice_date, total_amount').eq('company_id', form.company_id).order('invoice_date', { ascending: false })
      .then(({ data }) => {
        setInvoices(data || [])
        setForm((f) => ({ ...f, invoice_id: '' }))
      })
  }, [form.company_id, supabase])

  useEffect(() => {
    if (initialCompanyId && !form.company_id && companies.some((c) => c.id === initialCompanyId)) {
      setForm((f) => ({ ...f, company_id: initialCompanyId, invoice_id: payment.invoice_id || '' }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/hakedisler/${payment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_id: form.invoice_id || null,
        project_id: null,
        amount: parseFloat(form.amount),
        payment_date: form.payment_date,
        description: form.description || null,
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
    const res = await fetch(`/api/hakedisler/${payment.id}`, { method: 'DELETE' })
    setLoading(false)
    setShowDeleteConfirm(false)
    if (res.ok) {
      router.push('/dashboard/hakedisler')
      router.refresh()
    } else {
      const d = await res.json()
      alert(d.error || 'Silme başarısız')
    }
  }

  const displayText = payment.invoices
    ? `${(payment.invoices as { companies?: { name: string } }).companies?.name || '-'} • Fatura ${payment.invoices.invoice_no || '-'}`
    : payment.projects
      ? `${payment.projects.companies?.name || '-'} • ${payment.projects.name || '-'}`
      : '-'

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Hakediş Detayı</h1>
        <div className="flex items-center gap-2">
          {!editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(true)
                  if (invData?.company_id) setForm((f) => ({ ...f, company_id: invData.company_id, invoice_id: payment.invoice_id || '' }))
                }}
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
                onClick={() => { setEditMode(false); setForm({ company_id: form.company_id, invoice_id: payment.invoice_id || '', amount: payment.amount.toString(), payment_date: payment.payment_date, description: payment.description || '' }) }}
                className="px-3 py-1.5 rounded-lg border border-[#d2d6de] text-[#555] hover:bg-[#f8f9fc] text-sm font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                form="hakedis-edit-form"
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
        <form id="hakedis-edit-form" onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Firma *</label>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
              <option value="">Seçin</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Fatura *</label>
            <select value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })} required
              disabled={!form.company_id || invoices.length === 0}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white disabled:opacity-60">
              <option value="">{!form.company_id ? 'Önce firma seçin' : invoices.length === 0 ? 'Bu firmaya ait fatura yok' : 'Seçin'}</option>
              {invoices.map((inv) => <option key={inv.id} value={inv.id}>{inv.invoice_no} ({inv.invoice_date} - {Number(inv.total_amount).toLocaleString('tr-TR')} ₺)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tutar *</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tarih *</label>
              <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Açıklama</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none" />
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><dt className="text-sm text-[#555]">Firma / Fatura</dt><dd className="font-medium text-[#333]">{displayText}</dd></div>
          <div><dt className="text-sm text-[#555]">Tarih</dt><dd className="font-medium text-[#333]">{payment.payment_date}</dd></div>
          <div><dt className="text-sm text-[#555]">Tutar</dt><dd className="font-medium text-[#333]">{Number(payment.amount).toLocaleString('tr-TR')} ₺</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-[#555]">Açıklama</dt><dd className="font-medium text-[#333]">{payment.description || '-'}</dd></div>
        </dl>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#333] mb-2">Hakedişi Sil</h3>
            <p className="text-[#555] text-sm mb-4">Bu hakediş kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
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
