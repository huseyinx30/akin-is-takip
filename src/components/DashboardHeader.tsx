'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, Receipt, Bell, MessageCircle, Share2, ChevronRight, Check, ExternalLink } from 'lucide-react'

interface PendingExpense {
  id: string
  description: string
  amount: number
  expense_date: string
  type: 'personnel' | 'team'
  detayUrl: string
  profileName: string
}

interface DashboardHeaderProps {
  userName: string
  onMenuClick: () => void
  pendingCount?: number
  pendingExpenses?: PendingExpense[]
  role?: string
}

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Ana Sayfa',
  '/dashboard/firmalar': 'Firmalar',
  '/dashboard/projeler': 'Projeler',
  '/dashboard/onay-bekleyen-harcamalar': 'Onay Bekleyen Harcamalar',
  '/dashboard/faturalar': 'Faturalar',
  '/dashboard/hakedisler': 'Hakedişler',
  '/dashboard/urunler': 'Ürünler',
  '/dashboard/sirket-giderleri': 'Şirket Giderleri',
  '/dashboard/on-muhasebe': 'Ön Muhasebe',
  '/dashboard/personeller': 'Personeller',
  '/dashboard/ekipler': 'Ekipler',
  '/dashboard/harcamalarim': 'Harcamalarım',
  '/dashboard/is-kayitlarim': 'İş Kayıtlarım',
  '/dashboard/odemelerim': 'Ödemelerim',
}

export function DashboardHeader({ userName, onMenuClick, pendingCount = 0, pendingExpenses = [], role }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const basePath = pathname.replace(/\/[^/]+$/, '') || '/dashboard'
  const currentPage = breadcrumbMap[pathname] || breadcrumbMap[basePath] || 'Dashboard'
  const [openDropdown, setOpenDropdown] = useState<'expenses' | 'bell' | 'chat' | null>(null)
  const [expenses, setExpenses] = useState(pendingExpenses)
  const [loading, setLoading] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setExpenses(pendingExpenses)
  }, [pendingExpenses])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (key: 'expenses' | 'bell' | 'chat') => {
    setOpenDropdown((prev) => (prev === key ? null : key))
  }

  const handleApprove = async (id: string, type: 'personnel' | 'team') => {
    setLoading(id)
    const res = await fetch('/api/harcama-onay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, action: 'onayla' }),
    })
    setLoading(null)
    if (res.ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'İşlem başarısız')
    }
  }

  return (
    <header className="bg-[#3c8dbc] text-white shadow-md">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="font-bold text-xl">
            İş Takip
          </Link>
        </div>
        <div ref={dropdownRef} className="flex items-center gap-1 sm:gap-2 relative">
          {role === 'admin' && (
            <div className="relative">
              <button
                onClick={() => toggleDropdown('expenses')}
                className="p-2 hover:bg-white/10 rounded-lg relative"
                title="Onay bekleyen harcamalar"
              >
                <Receipt className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-1 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </button>
              {openDropdown === 'expenses' && (
                <div className="absolute right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-[#e3e6f0] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#e3e6f0]">
                    <p className="font-semibold text-[#333]">Onay Bekleyen Harcamalar</p>
                    <p className="text-xs text-[#555]">{pendingCount} adet harcama onay bekliyor</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {expenses.length > 0 ? (
                      expenses.map((e) => (
                        <div key={`${e.type}-${e.id}`} className="px-4 py-3 border-b border-[#e3e6f0] last:border-0">
                          <p className="text-sm font-medium text-[#333] truncate">{e.description}</p>
                          <p className="text-xs text-[#555]">{e.profileName} • {e.expense_date} • {Number(e.amount).toLocaleString('tr-TR')} ₺</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleApprove(e.id, e.type)}
                              disabled={loading === e.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-medium disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" /> Onay ver
                            </button>
                            <Link
                              href={e.detayUrl}
                              onClick={() => setOpenDropdown(null)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#3c8dbc] hover:bg-[#367fa9] text-white text-xs font-medium"
                            >
                              <ExternalLink className="w-3 h-3" /> Detay
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-[#555] text-sm">Onay bekleyen harcama yok</div>
                    )}
                  </div>
                  <Link href="/dashboard/onay-bekleyen-harcamalar" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-center text-sm text-[#3c8dbc] hover:bg-[#f8f9fc] font-medium">
                    Tümünü gör
                  </Link>
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('bell')}
              className="p-2 hover:bg-white/10 rounded-lg relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                12
              </span>
            </button>
            {openDropdown === 'bell' && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-[#e3e6f0] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#e3e6f0]">
                  <p className="font-semibold text-[#333]">Bildirimler</p>
                  <p className="text-xs text-[#555]">12 okunmamış bildirim</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-[#f8f9fc] cursor-pointer border-b border-[#e3e6f0]">
                    <p className="text-sm font-medium text-[#333]">Yeni bildirim</p>
                    <p className="text-xs text-[#555]">Henüz bildirim yok</p>
                  </div>
                </div>
                <Link href="/dashboard" className="block px-4 py-2 text-center text-sm text-[#3c8dbc] hover:bg-[#f8f9fc] font-medium">
                  Tümünü gör
                </Link>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown('chat')}
              className="p-2 hover:bg-white/10 rounded-lg relative"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                15
              </span>
            </button>
            {openDropdown === 'chat' && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-[#e3e6f0] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#e3e6f0]">
                  <p className="font-semibold text-[#333]">Sohbetler</p>
                  <p className="text-xs text-[#555]">15 okunmamış sohbet</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-[#f8f9fc] cursor-pointer border-b border-[#e3e6f0]">
                    <p className="text-sm font-medium text-[#333]">Yeni sohbet</p>
                    <p className="text-xs text-[#555]">Henüz sohbet yok</p>
                  </div>
                </div>
                <Link href="/dashboard" className="block px-4 py-2 text-center text-sm text-[#3c8dbc] hover:bg-[#f8f9fc] font-medium">
                  Tümünü gör
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pl-2 ml-2 border-l border-white/30">
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight">{userName}</p>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="px-4 py-2 bg-[#367fa9]">
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/dashboard" className="hover:underline">Home</Link>
          <ChevronRight className="w-4 h-4 opacity-70" />
          <span className="text-white">{currentPage}</span>
        </nav>
      </div>
    </header>
  )
}
