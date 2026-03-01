'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function YeniPersonelPage() {
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        full_name: form.full_name,
        role: 'personel',
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Bir hata oluştu')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div>
        <Link href="/dashboard/personeller" className="text-[#3c8dbc] hover:underline mb-4 inline-block font-medium">← Personellere dön</Link>
        <div className="bg-[#00a65a]/10 border border-[#00a65a]/30 rounded-lg p-6 text-[#00a65a] font-medium">
          Davet e-postası gönderildi. Personel e-postasındaki link ile şifre oluşturup giriş yapabilir.
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/personeller" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">← Personellere dön</Link>
        <h1 className="text-2xl font-bold text-[#333]">Yeni Personel Davet Et</h1>
        <p className="text-[#555] text-sm mt-0.5">Personel e-posta adresine davet gönderilir. Davet linki ile giriş yapıp şifre oluşturacak.</p>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {error && <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">E-posta *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Ad Soyad *</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Telefon</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50">
              {loading ? 'Gönderiliyor...' : 'Davet Gönder'}
            </button>
            <Link href="/dashboard/personeller" className="px-6 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc] font-medium">İptal</Link>
          </div>
        </form>
        <p className="mt-6 text-[#555] text-sm">Not: Davet özelliği Supabase Dashboard → Authentication → Providers → Email ayarlarını gerektirir. Alternatif: Personel /kayit sayfasından kendisi kayıt olup &quot;Personel&quot; rolünü seçebilir.</p>
      </div>
    </div>
  )
}
