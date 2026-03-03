'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function HakedisSilButton({ hakedisId, hakedisTutar }: { hakedisId: string; hakedisTutar: number }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch(`/api/hakedisler/${hakedisId}`, { method: 'DELETE' })
    setLoading(false)
    setShowConfirm(false)
    if (res.ok) {
      router.refresh()
    } else {
      const d = await res.json()
      alert(d.error || 'Silme başarısız')
    }
  }

  return (
    <>
      <button type="button" onClick={() => setShowConfirm(true)} className="p-1.5 rounded hover:bg-[#dd4b39]/10 text-[#dd4b39]" title="Sil">
        <Trash2 className="w-4 h-4" />
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#333] mb-2">Hakedişi Sil</h3>
            <p className="text-[#555] text-sm mb-4">{Number(hakedisTutar).toLocaleString('tr-TR')} ₺ tutarındaki hakediş kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} disabled={loading} className="px-4 py-2 rounded-lg border border-[#d2d6de] text-[#555] hover:bg-[#f8f9fc] font-medium disabled:opacity-50">İptal</button>
              <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-lg bg-[#dd4b39] hover:bg-[#c23321] text-white font-medium disabled:opacity-50">{loading ? 'Siliniyor...' : 'Evet, Sil'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
