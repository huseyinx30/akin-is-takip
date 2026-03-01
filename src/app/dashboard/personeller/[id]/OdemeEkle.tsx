'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, Wallet } from 'lucide-react'

export function OdemeEkle({ personelId }: { personelId: string }) {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], description: '', payment_type: 'avans' })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('personnel_payments').insert([{ personel_id: personelId, ...form, amount: parseFloat(form.amount) }])
    setForm({ amount: '', payment_date: new Date().toISOString().split('T')[0], description: '', payment_type: 'avans' })
    setShow(false)
    setLoading(false)
    window.location.reload()
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setShow(!show)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white text-sm font-medium"
      >
        <Wallet className="w-4 h-4" />
        Ödeme Ekle
        <ChevronDown className={`w-4 h-4 transition-transform ${show ? 'rotate-180' : ''}`} />
      </button>
      {show && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-[#e3e6f0] shadow-lg z-50 py-4 px-4">
          <p className="text-sm font-semibold text-[#333] mb-4">Yeni Ödeme</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">Tutar *</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">Tarih</label>
              <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">Tip</label>
              <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
                <option value="avans">Avans</option>
                <option value="maas">Maaş</option>
                <option value="hakedis">Hakediş</option>
                <option value="harcama">Harcama</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">Açıklama</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white text-sm font-medium disabled:opacity-50">
              Kaydet
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
