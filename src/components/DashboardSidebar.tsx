'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileText,
  Wallet,
  Package,
  Landmark,
  BarChart3,
  Users,
  UserCircle,
  CreditCard,
  ClipboardList,
  Banknote,
  LogOut,
  Search,
  ChevronDown,
  ChevronRight,
  Receipt,
} from 'lucide-react'
import type { UserRole } from '@/lib/types'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
  badge?: number
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Ana Sayfa', icon: LayoutDashboard, roles: ['admin', 'personel', 'ekip'] },
  { href: '/dashboard/firmalar', label: 'Firmalar', icon: Building2, roles: ['admin'] },
  { href: '/dashboard/projeler', label: 'Projeler & İşler', icon: FolderKanban, roles: ['admin', 'personel', 'ekip'] },
  { href: '/dashboard/faturalar', label: 'Faturalar', icon: FileText, roles: ['admin'] },
  { href: '/dashboard/hakedisler', label: 'Hakedişler', icon: Wallet, roles: ['admin'] },
  { href: '/dashboard/urunler', label: 'Ürünler & Mal Alımı', icon: Package, roles: ['admin'] },
  { href: '/dashboard/sirket-giderleri', label: 'Şirket Giderleri', icon: Landmark, roles: ['admin'] },
  { href: '/dashboard/on-muhasebe', label: 'Ön Muhasebe', icon: BarChart3, roles: ['admin'] },
  { href: '/dashboard/onay-bekleyen-harcamalar', label: 'Onay Bekleyen Harcamalar', icon: Receipt, roles: ['admin'] },
  { href: '/dashboard/personeller', label: 'Personeller', icon: Users, roles: ['admin'] },
  { href: '/dashboard/ekipler', label: 'Ekipler', icon: UserCircle, roles: ['admin'] },
  { href: '/dashboard/harcamalarim', label: 'Harcamalarım', icon: CreditCard, roles: ['personel', 'ekip'] },
  { href: '/dashboard/is-kayitlarim', label: 'İş Kayıtlarım', icon: ClipboardList, roles: ['personel', 'ekip'] },
  { href: '/dashboard/odemelerim', label: 'Ödemelerim', icon: Banknote, roles: ['personel', 'ekip'] },
]

interface DashboardSidebarProps {
  role: UserRole
  userName: string
  isOpen: boolean
  onClose: () => void
  pendingCount?: number
}

export function DashboardSidebar({ role, userName, isOpen, onClose, pendingCount = 0 }: DashboardSidebarProps) {
  const pathname = usePathname()
  const filteredNav = navItems.filter((item) => item.roles.includes(role))

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#222d32] text-[#b8c7ce] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#1a2226]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#3c8dbc] flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white text-sm">{userName}</p>
                <p className="text-xs text-[#b8c7ce] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Online
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="text"
                placeholder="Ara..."
                className="w-full pl-9 pr-3 py-2 bg-[#374850] border border-[#374850] rounded text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#3c8dbc]"
              />
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            <p className="px-4 py-2 text-xs font-semibold text-[#4b646f] uppercase tracking-wider">
              Ana Menü
            </p>
            {filteredNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              const showBadge = item.href.includes('onay-bekleyen-harcamalar') && pendingCount > 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-4 py-2.5 mx-2 rounded transition-colors ${
                    isActive ? 'bg-[#1e282c] text-[#fff]' : 'hover:bg-[#1e282c] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0 text-[#b8c7ce]" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {showBadge && (
                    <span className="px-2 py-0.5 bg-red-500 rounded text-xs font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="p-2 border-t border-[#1a2226]">
            <Link
              href="/cikis"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded text-red-400 hover:bg-[#1e282c] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Çıkış Yap</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
