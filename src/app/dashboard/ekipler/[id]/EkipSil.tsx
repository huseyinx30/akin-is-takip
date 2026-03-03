'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function EkipSil({ ekipId, ekipAdi }: { ekipId: string; ekipAdi: string }) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch(`/api/ekipler/${ekipId}`, { method: 'DELETE' })
    setLoading(false)
    setShowConfirm(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Ekip silinirken bir hata oluştu.')
      return
    }
    router.push('/dashboard/ekipler')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#dd4b39]/10 hover:bg-[#dd4b39]/20 text-[#dd4b39] text-sm font-medium"
      >
        <Trash2 className="w-4 h-4" />
        Ekibi Sil
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#333] mb-2">Ekibi Sil</h3>
            <p className="text-[#555] text-sm mb-4">
              <strong>{ekipAdi}</strong> ekibini silmek istediğinize emin misiniz? Bu işlem geri alınamaz. Tüm harcama, ödeme ve iş kayıtları da silinecektir.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-[#d2d6de] text-[#555] hover:bg-[#f8f9fc] font-medium disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#dd4b39] hover:bg-[#c23321] text-white font-medium disabled:opacity-50"
              >
                {loading ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
