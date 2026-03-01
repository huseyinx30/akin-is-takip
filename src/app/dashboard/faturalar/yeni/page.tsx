'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function YeniFaturaPage() {
  const [form, setForm] = useState({
    company_id: '',
    invoice_no: '',
    invoice_date: new Date().toISOString().split('T')[0],
    total_amount: '',
    currency: 'TRY',
    status: 'kesildi',
  })
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from('companies').select('id, name').order('name').then(({ data }) => setCompanies(data || []))
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('invoices').insert([{
      ...form,
      total_amount: parseFloat(form.total_amount),
    }])

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/faturalar')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/faturalar" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">← Faturalara dön</Link>
        <h1 className="text-2xl font-bold text-[#333]">Yeni Fatura Ekle</h1>
        <p className="text-[#555] text-sm mt-0.5">Fatura bilgilerini girin</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {error && <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Firma *</label>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
              <option value="">Seçin</option>
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
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link href="/dashboard/faturalar" className="px-6 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc] font-medium">İptal</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
