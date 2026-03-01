'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function YeniFirmaPage() {
  const [form, setForm] = useState({
    name: '',
    tax_number: '',
    tax_office: '',
    address: '',
    phone: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('companies').insert([form])

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/firmalar')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/firmalar" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">
          ← Firmalara dön
        </Link>
        <h1 className="text-2xl font-bold text-[#333]">Yeni Firma Ekle</h1>
        <p className="text-[#555] text-sm mt-0.5">Firma bilgilerini girin</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Firma Adı *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              placeholder="Firma adı"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Vergi No</label>
              <input
                type="text"
                value={form.tax_number}
                onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
                placeholder="Vergi numarası"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Vergi Dairesi</label>
              <input
                type="text"
                value={form.tax_office}
                onChange={(e) => setForm({ ...form, tax_office: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
                placeholder="Vergi dairesi"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Adres</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none"
              placeholder="Adres"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
                placeholder="Telefon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
                placeholder="ornek@email.com"
              />
            </div>
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
              href="/dashboard/firmalar"
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
