'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  role: string
}

export function MesajGonder({ profiles }: { profiles: Profile[] }) {
  const [showForm, setShowForm] = useState(false)
  const [receiverId, setReceiverId] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiverId || !content.trim()) return
    setLoading(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: receiverId, content: content.trim() }),
    })
    setLoading(false)
    if (res.ok) {
      setShowForm(false)
      setReceiverId('')
      setContent('')
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'Mesaj gönderilemedi')
    }
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
      >
        <Send className="w-4 h-4" />
        Mesaj Gönder
      </button>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#333] mb-4">Yeni Mesaj</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#555] mb-1">Alıcı</label>
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
                >
                  <option value="">Seçin</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.role === 'personel' ? 'Personel' : 'Ekip'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555] mb-1">Mesaj</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none"
                  placeholder="Mesajınızı yazın..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-[#d2d6de] text-[#555] hover:bg-[#f8f9fc]">
                  İptal
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50">
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
