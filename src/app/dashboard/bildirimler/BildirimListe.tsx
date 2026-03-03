'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

const typeIcons: Record<string, React.ElementType> = {
  harcama_onaylandi: CheckCircle,
  harcama_reddedildi: XCircle,
  mesaj: MessageSquare,
}

const typeColors: Record<string, string> = {
  harcama_onaylandi: 'text-[#00a65a] bg-[#00a65a]/15',
  harcama_reddedildi: 'text-[#dd4b39] bg-[#dd4b39]/15',
  mesaj: 'text-[#3c8dbc] bg-[#3c8dbc]/15',
}

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link_url: string | null
  read_at: string | null
  created_at: string
}

export function BildirimListe({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const router = useRouter()

  const handleClick = async (n: Notification) => {
    if (!n.read_at) {
      await fetch(`/api/notifications/${n.id}/read`, { method: 'POST' })
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
    }
    if (n.link_url) {
      router.push(n.link_url)
    }
    router.refresh()
  }

  const unread = notifications.filter((n) => !n.read_at)
  const read = notifications.filter((n) => n.read_at)

  return (
    <div className="space-y-6">
      {unread.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#555] mb-3">Okunmamış ({unread.length})</h2>
          <div className="space-y-2">
            {unread.map((n) => {
              const Icon = typeIcons[n.type] || Bell
              const colorClass = typeColors[n.type] || 'text-[#555] bg-[#f8f9fc]'
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className="flex gap-4 p-4 bg-white rounded-lg shadow-md border border-[#e3e6f0] hover:border-[#3c8dbc]/30 cursor-pointer transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#333]">{n.title}</p>
                    {n.body && <p className="text-sm text-[#555] mt-0.5">{n.body}</p>}
                    <p className="text-xs text-[#999] mt-1">{new Date(n.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#555] mb-3">Okunmuş</h2>
          <div className="space-y-2">
            {read.map((n) => {
              const Icon = typeIcons[n.type] || Bell
              const colorClass = typeColors[n.type] || 'text-[#555] bg-[#f8f9fc]'
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex gap-4 p-4 rounded-lg border transition-colors ${n.link_url ? 'bg-white shadow-md border-[#e3e6f0] hover:border-[#3c8dbc]/30 cursor-pointer' : 'bg-[#f8f9fc] border-[#e3e6f0] opacity-75'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#333]">{n.title}</p>
                    {n.body && <p className="text-sm text-[#555] mt-0.5">{n.body}</p>}
                    <p className="text-xs text-[#999] mt-1">{new Date(n.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-12 text-center text-[#555]">
          <Bell className="w-12 h-12 mx-auto mb-4 text-[#b8c7ce]" />
          <p>Henüz bildirim yok</p>
        </div>
      )}
    </div>
  )
}
