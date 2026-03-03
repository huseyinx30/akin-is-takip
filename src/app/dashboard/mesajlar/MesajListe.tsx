'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Send, Inbox } from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read_at: string | null
  created_at: string
}

interface MesajListeProps {
  messages: Message[]
  currentProfileId: string
}

export function MesajListe({ messages, currentProfileId }: MesajListeProps) {
  const [localMessages, setLocalMessages] = useState(messages)
  const router = useRouter()

  const handleClick = async (m: Message) => {
    if (m.receiver_id === currentProfileId && !m.read_at) {
      await fetch(`/api/messages/${m.id}/read`, { method: 'POST' })
      setLocalMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, read_at: new Date().toISOString() } : x))
    }
    router.refresh()
  }

  const received = localMessages.filter((m) => m.receiver_id === currentProfileId)
  const sent = localMessages.filter((m) => m.sender_id === currentProfileId)
  const unreadCount = received.filter((m) => !m.read_at).length

  return (
    <div className="space-y-6">
      {unreadCount > 0 && (
        <p className="text-sm text-[#555]">{unreadCount} okunmamış mesaj</p>
      )}

      <div className="space-y-4">
        {localMessages.length > 0 ? (
          localMessages.map((m) => {
            const isReceived = m.receiver_id === currentProfileId
            const isUnread = isReceived && !m.read_at
            return (
              <div
                key={m.id}
                onClick={() => handleClick(m)}
                className={`flex gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                  isUnread
                    ? 'bg-[#3c8dbc]/5 border-[#3c8dbc]/30'
                    : 'bg-white shadow-md border-[#e3e6f0] hover:border-[#3c8dbc]/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isReceived ? 'bg-[#3c8dbc]/15 text-[#3c8dbc]' : 'bg-[#00a65a]/15 text-[#00a65a]'}`}>
                  {isReceived ? <Inbox className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isReceived ? 'text-[#333]' : 'text-[#555]'}`}>
                    {isReceived ? 'Gelen mesaj' : 'Gönderilen mesaj'}
                    {isUnread && <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">Yeni</span>}
                  </p>
                  <p className="text-sm text-[#555] mt-1 whitespace-pre-wrap">{m.content}</p>
                  <p className="text-xs text-[#999] mt-2">{new Date(m.created_at).toLocaleString('tr-TR')}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-12 text-center text-[#555]">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[#b8c7ce]" />
            <p>Henüz mesaj yok</p>
          </div>
        )}
      </div>
    </div>
  )
}
