'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const categories = [
  { value: 'demirbas', label: 'Demirbaş' },
  { value: 'giyim', label: 'Giyim' },
  { value: 'arac_vergi', label: 'Araç Vergi' },
  { value: 'yakit', label: 'Yakıt' },
  { value: 'yemek', label: 'Yemek' },
  { value: 'diger', label: 'Diğer' },
]

export default function YeniSirketGideriPage() {
  const [form, setForm] = useState({
    category: 'diger',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('company_expenses').insert([{
      ...form,
      amount: parseFloat(form.amount),
    }])
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard/sirket-giderleri')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/sirket-giderleri" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">← Giderlere dön</Link>
        <h1 className="text-2xl font-bold text-[#333]">Yeni Şirket Gideri Ekle</h1>
        <p className="text-[#555] text-sm mt-0.5">Gider bilgilerini girin</p>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {error && <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Kategori *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Açıklama *</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tutar *</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tarih *</label>
              <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Notlar</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2} className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link href="/dashboard/sirket-giderleri" className="px-6 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc] font-medium">İptal</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
