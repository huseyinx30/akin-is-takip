'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Receipt, Trash2, ChevronDown, ChevronUp, Filter, X, CheckCircle, XCircle } from 'lucide-react'

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

const categories = [
  { value: 'yakit', label: 'Yakıt' },
  { value: 'yemek', label: 'Yemek' },
  { value: 'konaklama', label: 'Konaklama' },
  { value: 'ulasim', label: 'Ulaşım' },
  { value: 'diger', label: 'Diğer' },
]

export function TumHarcamalar({ personelId, statusFilter = '' }: { personelId: string; statusFilter?: '' | 'onaylandi' | 'beklemede' | 'reddedildi' }) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])
  const [showAll, setShowAll] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    cityId: '',
    category: '',
    search: '',
    status: '',
  })
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const [{ data: expData }, { data: cityData }] = await Promise.all([
        supabase
          .from('personnel_expenses')
          .select('*, city:cities(name)')
          .eq('personel_id', personelId)
          .order('expense_date', { ascending: false }),
        supabase.from('cities').select('id, name').order('name'),
      ])
      setExpenses(expData || [])
      setCities(cityData || [])
    }
    load()
  }, [personelId])

  const effectiveStatus = statusFilter || filters.status

  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((e) => {
      if (effectiveStatus && e.status !== effectiveStatus) return false
      if (filters.dateFrom && e.expense_date < filters.dateFrom) return false
      if (filters.dateTo && e.expense_date > filters.dateTo) return false
      if (filters.cityId && e.city_id !== filters.cityId) return false
      if (filters.category && e.category !== filters.category) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const desc = (e.description || '').toLowerCase()
        const loc = (e.location || '').toLowerCase()
        const cat = (e.category || '').toLowerCase()
        if (!desc.includes(q) && !loc.includes(q) && !cat.includes(q)) return false
      }
      return true
    })
  }, [expenses, filters, effectiveStatus])

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.cityId || filters.category || filters.search || effectiveStatus

  const clearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', cityId: '', category: '', search: '', status: '' })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size >= displayList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(displayList.map((e) => e.id)))
    }
  }

  const handleBulkApprove = async () => {
    if (!selectedIds.size || !confirm(`${selectedIds.size} harcamayı onaylamak istediğinize emin misiniz?`)) return
    setBulkLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user?.id).single()
    for (const id of selectedIds) {
      await supabase.from('personnel_expenses').update({ status: 'onaylandi', approved_by: profile?.id, approved_at: new Date().toISOString() }).eq('id', id)
    }
    setExpenses((prev) => prev.map((e) => selectedIds.has(e.id) ? { ...e, status: 'onaylandi' } : e))
    setSelectedIds(new Set())
    setBulkLoading(false)
  }

  const handleBulkReject = async () => {
    if (!selectedIds.size || !confirm(`${selectedIds.size} harcamayı reddetmek istediğinize emin misiniz?`)) return
    setBulkLoading(true)
    for (const id of selectedIds) {
      await supabase.from('personnel_expenses').update({ status: 'reddedildi' }).eq('id', id)
    }
    setExpenses((prev) => prev.map((e) => selectedIds.has(e.id) ? { ...e, status: 'reddedildi' } : e))
    setSelectedIds(new Set())
    setBulkLoading(false)
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.size || !confirm(`${selectedIds.size} harcamayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return
    setBulkLoading(true)
    const idsToDelete = Array.from(selectedIds)
    const deletedIds: string[] = []
    for (const id of idsToDelete) {
      const res = await fetch(`/api/personnel-expenses/${id}`, { method: 'DELETE' })
      if (res.ok) deletedIds.push(id)
    }
    setExpenses((prev) => prev.filter((e) => !deletedIds.includes(e.id)))
    setSelectedIds(new Set())
    setBulkLoading(false)
  }

  const displayList = showAll ? filteredExpenses : filteredExpenses.slice(0, 10)
  const hasMore = filteredExpenses.length > 10

  return (
    <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6 mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-lg font-medium text-[#333] flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Tüm Harcamalar
          {hasActiveFilters && (
            <span className="text-sm font-normal text-[#555]">({filteredExpenses.length} sonuç)</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${showFilters || hasActiveFilters ? 'bg-[#3c8dbc] text-white' : 'bg-[#f8f9fc] text-[#555] hover:bg-[#e3e6f0]'}`}
          >
            <Filter className="w-4 h-4" />
            Filtrele
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white/80" />}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-[#dd4b39] hover:bg-[#dd4b39]/10"
            >
              <X className="w-4 h-4" />
              Temizle
            </button>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-[#3c8dbc]/5 rounded-lg border border-[#3c8dbc]/30 flex flex-wrap items-center gap-3">
          <span className="text-[#333] font-medium">{selectedIds.size} harcama seçildi</span>
          <button
            onClick={handleBulkApprove}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a65a] hover:bg-[#008d4c] text-white text-sm font-medium disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Onayla
          </button>
          <button
            onClick={handleBulkReject}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f39c12] hover:bg-[#e08e0b] text-white text-sm font-medium disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reddet
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dd4b39] hover:bg-[#c23321] text-white text-sm font-medium disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-[#555] hover:text-[#333] text-sm font-medium"
          >
            Seçimi kaldır
          </button>
        </div>
      )}

      {showFilters && (
        <div className="mb-6 p-4 bg-[#f8f9fc] rounded-lg border border-[#e3e6f0]">
          <p className="text-xs font-medium text-[#555] mb-3">Filtreler</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">İl</label>
              <select
                value={filters.cityId}
                onChange={(e) => setFilters((f) => ({ ...f, cityId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
              >
                <option value="">Tümü</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">Kategori</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
              >
                <option value="">Tümü</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#555] mb-1">Açıklama / Konum Ara</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Açıklama veya konumda ara..."
                className="w-full px-3 py-2 rounded-lg border border-[#d2d6de] text-[#333] text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] placeholder-[#999]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {displayList.length > 0 && (
          <div className="flex items-center gap-3 pb-2 border-b border-[#e3e6f0]">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#555] hover:text-[#333]">
              <input
                type="checkbox"
                checked={displayList.length > 0 && selectedIds.size === displayList.length}
                onChange={toggleSelectAll}
                className="rounded border-[#d2d6de] text-[#3c8dbc] focus:ring-[#3c8dbc]"
              />
              Tümünü seç
            </label>
          </div>
        )}
        {displayList.map((e) => (
          <div
            key={e.id}
            className={`flex justify-between items-center p-3 rounded-lg border group ${selectedIds.has(e.id) ? 'bg-[#3c8dbc]/10 border-[#3c8dbc]/40' : 'bg-[#f8f9fc] border-[#e3e6f0]'}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={selectedIds.has(e.id)}
                onChange={() => toggleSelect(e.id)}
                className="rounded border-[#d2d6de] text-[#3c8dbc] focus:ring-[#3c8dbc] shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[#333] font-medium block truncate">{e.description}</span>
                <span className="text-[#555] text-sm">
                  {e.expense_date}
                  {e.city?.name && ` • ${e.city.name}`}
                  {e.category && ` • ${categories.find((c) => c.value === e.category)?.label || e.category}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[e.status] || ''}`}>
                {statusLabels[e.status] || e.status}
              </span>
              <span className="text-[#333] font-medium w-24 text-right">{Number(e.amount).toLocaleString('tr-TR')} ₺</span>
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
            <>Tümünü göster ({filteredExpenses.length} harcama) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}

      {filteredExpenses.length === 0 && (
        <p className="text-[#555] text-center py-8">
          {hasActiveFilters ? 'Filtreye uygun harcama bulunamadı.' : 'Henüz harcama kaydı yok.'}
        </p>
      )}
    </div>
  )
}
