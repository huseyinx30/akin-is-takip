'use client'

import { useState } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { DashboardSidebar } from './DashboardSidebar'
import type { UserRole } from '@/lib/types'

interface PendingExpense {
  id: string
  description: string
  amount: number
  expense_date: string
  type: 'personnel' | 'team'
  detayUrl: string
  profileName: string
}

interface DashboardWrapperProps {
  role: UserRole
  userName: string
  pendingCount?: number
  pendingExpenses?: PendingExpense[]
  children: React.ReactNode
}

export function DashboardWrapper({ role, userName, pendingCount = 0, pendingExpenses = [], children }: DashboardWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#ecf0f5]">
      <DashboardSidebar
        role={role}
        userName={userName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader userName={userName} onMenuClick={() => setSidebarOpen((o) => !o)} pendingCount={pendingCount} pendingExpenses={pendingExpenses} role={role} />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
