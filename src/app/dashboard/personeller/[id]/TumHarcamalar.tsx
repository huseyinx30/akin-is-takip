'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Receipt, Trash2, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'

const statusLabels: Record<string, string> = {
  beklemede: 'Beklemede',
  onaylandi: 'Onaylandı',
  reddedildi: 'Reddedildi',
}

const statusColors: Record<string, string> = {
  beklemede: 'bg-[#f39c12]/15 text-[#f39c12]',
  onaylandi: 'bg-[#00a65a]/15 text-[#00a65a]',
  reddedildi: 'bg-[#dd4b39]/15 text-[#dd4b39]',
}

export function TumHarcamalar({ personelId }: { personelId: string }) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [showAll, setShowAll] = useState(false)
  const [reportMode, setReportMode] = useState<'liste' | 'haftalik' | 'aylik'>('liste')
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('personnel_expenses')
      .select('*')
      .eq('personel_id', personelId)
      .order('expense_date', { ascending: false })
      .then(({ data }) => setExpenses(data || []))
  }, [personelId])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu harcamayı silmek istediğinize emin misiniz?')) return
    setDeleting(id)
    const res = await fetch(`/api/personnel-expenses/${id}`, { method: 'DELETE' })
    setDeleting(null)
    if (!res.ok) return
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    window.location.reload()
  }

  const getWeekRange = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] }
  }

  const getMonthKey = (dateStr: string) => {
    return dateStr.substring(0, 7)
  }

  const weeklyReport = () => {
    const byWeek: Record<string, { total: number; items: any[] }> = {}
    ;(expenses || []).forEach((e) => {
      const { start } = getWeekRange(e.expense_date)
      if (!byWeek[start]) byWeek[start] = { total: 0, items: [] }
      byWeek[start].total += Number(e.amount)
      byWeek[start].items.push(e)
    })
    return Object.entries(byWeek)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([weekStart, data]) => ({
        weekStart,
        weekEnd: getWeekRange(weekStart).end,
        ...data,
      }))
  }

  const monthlyReport = () => {
    const byMonth: Record<string, { total: number; items: any[] }> = {}
    ;(expenses || []).forEach((e) => {
      const key = getMonthKey(e.expense_date)
      if (!byMonth[key]) byMonth[key] = { total: 0, items: [] }
      byMonth[key].total += Number(e.amount)
      byMonth[key].items.push(e)
    })
    return Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({ month, ...data }))
  }

  const displayList = showAll ? expenses : expenses.slice(0, 5)
  const hasMore = expenses.length > 5

  return (
    <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6 mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-lg font-medium text-[#333] flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Tüm Harcamalar
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setReportMode('liste')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${reportMode === 'liste' ? 'bg-[#3c8dbc] text-white' : 'bg-[#f8f9fc] text-[#555] hover:bg-[#e3e6f0]'}`}
          >
            Liste
          </button>
          <button
            onClick={() => setReportMode('haftalik')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${reportMode === 'haftalik' ? 'bg-[#3c8dbc] text-white' : 'bg-[#f8f9fc] text-[#555] hover:bg-[#e3e6f0]'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Haftalık
          </button>
          <button
            onClick={() => setReportMode('aylik')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${reportMode === 'aylik' ? 'bg-[#3c8dbc] text-white' : 'bg-[#f8f9fc] text-[#555] hover:bg-[#e3e6f0]'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Aylık
          </button>
        </div>
      </div>

      {reportMode === 'liste' && (
        <>
          <div className="space-y-2">
            {displayList.map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center p-3 bg-[#f8f9fc] rounded-lg border border-[#e3e6f0] group"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[#333] font-medium block truncate">{e.description}</span>
                  <span className="text-[#555] text-sm">{e.expense_date} • {e.category}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[e.status] || ''}`}>
                    {statusLabels[e.status] || e.status}
                  </span>
                  <span className="text-[#333] font-medium w-24 text-right">{Number(e.amount).toLocaleString('tr-TR')} ₺</span>
                  {e.status === 'onaylandi' && (
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={deleting === e.id}
                      className="p-1.5 rounded text-[#dd4b39] hover:bg-[#dd4b39]/10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      title="Harcamayı sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-[#3c8dbc] hover:bg-[#3c8dbc]/5 rounded-lg font-medium text-sm"
            >
              {showAll ? (
                <>Daha az göster <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Tümünü göster ({expenses.length} harcama) <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </>
      )}

      {reportMode === 'haftalik' && (
        <div className="space-y-4">
          {weeklyReport().map(({ weekStart, weekEnd, total, items }) => (
            <div key={weekStart} className="p-4 bg-[#f8f9fc] rounded-lg border border-[#e3e6f0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#555] font-medium">
                  {new Date(weekStart).toLocaleDateString('tr-TR')} – {new Date(weekEnd).toLocaleDateString('tr-TR')}
                </span>
                <span className="text-[#333] font-bold">{total.toLocaleString('tr-TR')} ₺</span>
              </div>
              <ul className="text-sm text-[#555] space-y-1">
                {items.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex justify-between">
                    <span>{e.description}</span>
                    <span>{Number(e.amount).toLocaleString('tr-TR')} ₺</span>
                  </li>
                ))}
                {items.length > 5 && <li className="text-[#999]">+{items.length - 5} kayıt daha</li>}
              </ul>
            </div>
          ))}
        </div>
      )}

      {reportMode === 'aylik' && (
        <div className="space-y-4">
          {monthlyReport().map(({ month, total, items }) => (
            <div key={month} className="p-4 bg-[#f8f9fc] rounded-lg border border-[#e3e6f0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#555] font-medium">
                  {new Date(month + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </span>
                <span className="text-[#333] font-bold">{total.toLocaleString('tr-TR')} ₺</span>
              </div>
              <ul className="text-sm text-[#555] space-y-1">
                {items.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex justify-between">
                    <span>{e.description} ({e.expense_date})</span>
                    <span>{Number(e.amount).toLocaleString('tr-TR')} ₺</span>
                  </li>
                ))}
                {items.length > 5 && <li className="text-[#999]">+{items.length - 5} kayıt daha</li>}
              </ul>
            </div>
          ))}
        </div>
      )}

      {expenses.length === 0 && (
        <p className="text-[#555] text-center py-8">Henüz harcama kaydı yok.</p>
      )}
    </div>
  )
}
