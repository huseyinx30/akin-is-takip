'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const categories = [
  { value: 'yakit', label: 'Yakıt' },
  { value: 'yemek', label: 'Yemek' },
  { value: 'konaklama', label: 'Konaklama' },
  { value: 'ulasim', label: 'Ulaşım' },
  { value: 'diger', label: 'Diğer' },
]

const statusLabels: Record<string, string> = {
  beklemede: 'Beklemede',
  onaylandi: 'Onaylandı',
  reddedildi: 'Reddedildi',
}

export default function HarcamalarimPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [profile, setProfile] = useState<{ id: string; role: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    category: 'yakit',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    location: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).single()
      setProfile(prof)
      if (!prof) return

      const table = prof.role === 'personel' ? 'personnel_expenses' : 'team_expenses'
      const idField = prof.role === 'personel' ? 'personel_id' : 'ekip_id'
      const { data } = await supabase.from(table).select('*').eq(idField, prof.id).order('expense_date', { ascending: false })
      setExpenses(data || [])
    }
    load()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    setError(null)

    const table = profile.role === 'personel' ? 'personnel_expenses' : 'team_expenses'
    const idField = profile.role === 'personel' ? 'personel_id' : 'ekip_id'

    const { error } = await supabase.from(table).insert([{
      [idField]: profile.id,
      ...form,
      amount: parseFloat(form.amount),
    }])

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setForm({ category: 'yakit', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], location: '' })
    setShowForm(false)
    const { data } = await supabase.from(table).select('*').eq(idField, profile.id).order('expense_date', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }

  if (!profile) return <div className="p-8 text-[#555]">Yükleniyor...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Harcamalarım</h1>
          <p className="text-[#555] text-sm mt-0.5">Harcama kayıtlarınız ve onay durumları</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
        >
          {showForm ? 'İptal' : '+ Yeni Harcama'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md border border-[#e3e6f0] space-y-4">
          {error && <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tarih</label>
              <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Açıklama *</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] placeholder-[#999]" placeholder="Örn: Benzin" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Tutar *</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Konum</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] placeholder-[#999]" placeholder="İl/Şehir" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {expenses.map((e) => (
          <div key={e.id} className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6 flex justify-between items-center">
            <div>
              <div className="font-medium text-[#333]">{e.description}</div>
              <div className="text-[#555] text-sm mt-1">{e.expense_date} • {e.category} {e.location && `• ${e.location}`}</div>
            </div>
            <div className="text-right">
              <div className="text-[#333] font-medium">{Number(e.amount).toLocaleString('tr-TR')} ₺</div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${e.status === 'onaylandi' ? 'bg-[#00a65a]/15 text-[#00a65a]' : e.status === 'reddedildi' ? 'bg-[#dd4b39]/15 text-[#dd4b39]' : 'bg-[#f39c12]/15 text-[#f39c12]'}`}>
                {statusLabels[e.status] || e.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 && !showForm && (
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-12 text-center text-[#555]">
          Henüz harcama kaydınız yok. Yeni harcama eklemek için yukarıdaki butonu kullanın.
        </div>
      )}
    </div>
  )
}
