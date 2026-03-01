'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function YeniHakedisPage() {
  const [form, setForm] = useState({
    company_id: '',
    invoice_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
  })
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [invoices, setInvoices] = useState<{ id: string; invoice_no: string; invoice_date: string; total_amount: number }[]>([])
  const [kalanTutar, setKalanTutar] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from('companies').select('id, name').order('name').then(({ data }) => setCompanies(data || []))
  }, [supabase])

  useEffect(() => {
    if (!form.company_id) {
      setInvoices([])
      setForm((f) => ({ ...f, invoice_id: '' }))
      return
    }
    supabase
      .from('invoices')
      .select('id, invoice_no, invoice_date, total_amount')
      .eq('company_id', form.company_id)
      .order('invoice_date', { ascending: false })
      .then(({ data }) => {
        setInvoices(data || [])
        setForm((f) => ({ ...f, invoice_id: '' }))
      })
  }, [form.company_id, supabase])

  useEffect(() => {
    if (!form.invoice_id || invoices.length === 0) {
      setKalanTutar(null)
      return
    }
    const selectedInv = invoices.find((i) => i.id === form.invoice_id)
    if (!selectedInv) {
      setKalanTutar(null)
      return
    }
    const faturaToplam = Number(selectedInv.total_amount)
    supabase
      .from('progress_payments')
      .select('amount')
      .eq('invoice_id', form.invoice_id)
      .then(({ data }) => {
        const yapilanHakedis = (data || []).reduce((s, p) => s + Number(p.amount), 0)
        setKalanTutar(faturaToplam - yapilanHakedis)
      })
  }, [form.invoice_id, invoices, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('progress_payments').insert([{
      invoice_id: form.invoice_id,
      project_id: null,
      amount: parseFloat(form.amount),
      payment_date: form.payment_date,
      description: form.description || null,
    }])
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard/hakedisler')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/hakedisler" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">← Hakedişlere dön</Link>
        <h1 className="text-2xl font-bold text-[#333]">Yeni Hakediş Ekle</h1>
        <p className="text-[#555] text-sm mt-0.5">Kestiğiniz faturaya ait hakediş bilgilerini girin</p>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {error && <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Firma *</label>
            <select
              value={form.company_id}
              onChange={(e) => setForm({ ...form, company_id: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
            >
              <option value="">Seçin</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Fatura No *</label>
            <select
              value={form.invoice_id}
              onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
              required
              disabled={!form.company_id || invoices.length === 0}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">
                {!form.company_id ? 'Önce firma seçin' : invoices.length === 0 ? 'Bu firmaya ait fatura yok' : 'Seçin'}
              </option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_no} ({inv.invoice_date} - {Number(inv.total_amount).toLocaleString('tr-TR')} ₺)
                </option>
              ))}
            </select>
            {kalanTutar !== null && (
              <p className="mt-2 text-sm font-medium text-[#3c8dbc]">
                Kesilen faturadan yapılan hakedişten kalan tutar: <span className="font-bold">{kalanTutar.toLocaleString('tr-TR')} ₺</span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tutar *</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tarih *</label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link href="/dashboard/hakedisler" className="px-6 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc] font-medium">
              İptal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
