'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function YeniProjePage() {
  const [form, setForm] = useState({
    company_id: '',
    city_id: '',
    name: '',
    description: '',
    status: 'aktif',
  })
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const [companiesRes, citiesRes] = await Promise.all([
        supabase.from('companies').select('id, name').order('name'),
        supabase.from('cities').select('id, name').order('name'),
      ])
      setCompanies(companiesRes.data || [])
      setCities(citiesRes.data || [])
    }
    fetch()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('projects').insert([form])

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/projeler')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/projeler" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">
          ← Projelere dön
        </Link>
        <h1 className="text-2xl font-bold text-[#333]">Yeni Proje Ekle</h1>
        <p className="text-[#555] text-sm mt-0.5">Proje bilgilerini girin</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>
          )}
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
            <label className="block text-sm font-medium text-[#333] mb-1">İl *</label>
            <select
              value={form.city_id}
              onChange={(e) => setForm({ ...form, city_id: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
            >
              <option value="">Seçin</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Proje Adı *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              placeholder="Proje adı"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none"
              placeholder="Açıklama"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Durum</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
            >
              <option value="aktif">Aktif</option>
              <option value="beklemede">Beklemede</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link
              href="/dashboard/projeler"
              className="px-6 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc] font-medium"
            >
              İptal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
