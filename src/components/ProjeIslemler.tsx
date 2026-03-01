'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2 } from 'lucide-react'

interface ProjeIslemlerProps {
  projeId: string
  isAdmin?: boolean
}

export function ProjeIslemler({ projeId, isAdmin = false }: ProjeIslemlerProps) {
  const router = useRouter()

  const handleSil = async () => {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return

    const res = await fetch(`/api/projeler/${projeId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'Silme işlemi başarısız.')
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/dashboard/projeler/${projeId}`}
        title="Görüntüle"
        className="p-2 rounded text-[#3c8dbc] hover:bg-[#3c8dbc]/10"
      >
        <Eye className="w-4 h-4" />
      </Link>
      {isAdmin && (
        <>
          <Link
            href={`/dashboard/projeler/${projeId}/duzenle`}
            title="Düzenle"
            className="p-2 rounded text-[#f39c12] hover:bg-[#f39c12]/10"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={handleSil}
            title="Sil"
            className="p-2 rounded text-[#dd4b39] hover:bg-[#dd4b39]/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
