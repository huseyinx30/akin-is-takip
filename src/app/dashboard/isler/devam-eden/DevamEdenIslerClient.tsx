'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, Pencil, Trash2, CheckCircle, FolderKanban, Plus } from 'lucide-react'

const workTypes: Record<string, string> = {
  kurulum: 'Kurulum',
  montaj: 'Montaj',
  servis: 'Servis',
  demontaj: 'Demontaj',
}

interface Project {
  id: string
  name: string
  count: number
}

interface Profile {
  id: string
  full_name: string
  role: string
}

interface WorkLog {
  id: string
  personel_id: string | null
  ekip_id: string | null
  project_id: string
  work_date: string
  work_type: string
  description: string
  work_quantity: number | null
  status: string
  project?: { name: string }
  city?: { name: string }
  personel?: { full_name: string }
  ekip?: { full_name: string }
}

interface ProjectFull {
  id: string
  name: string
  city_id: string | null
}

interface City {
  id: string
  name: string
}

interface DevamEdenIslerClientProps {
  initialProjects: Project[]
  profiles: Profile[]
  allProjects: ProjectFull[]
  cities: City[]
  currentAdmin: { id: string; full_name: string; role: string } | null
}

export function DevamEdenIslerClient({ initialProjects, profiles, allProjects, cities, currentAdmin }: DevamEdenIslerClientProps) {
  const searchParams = useSearchParams()
  const projectParam = searchParams.get('project')
  const [projects, setProjects] = useState(initialProjects)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectParam || null)
  const [logs, setLogs] = useState<WorkLog[]>([])
  const [loading, setLoading] = useState(false)
  const [filterProfileId, setFilterProfileId] = useState<string>('')
  const [detailLog, setDetailLog] = useState<WorkLog | null>(null)
  const [editLog, setEditLog] = useState<WorkLog | null>(null)
  const [editForm, setEditForm] = useState({ work_date: '', work_type: 'kurulum', description: '', work_quantity: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({
    project_id: '',
    city_id: '',
    assignee_id: currentAdmin?.id || '',
    work_date: new Date().toISOString().split('T')[0],
    work_type: 'kurulum',
    description: '',
    work_quantity: '',
  })
  const [addLoading, setAddLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const loadLogs = useCallback(async () => {
    if (!selectedProjectId) return
    setLoading(true)
    let q = supabase
      .from('work_logs')
      .select('*, project:projects(name), city:cities(name), personel:profiles!personel_id(full_name), ekip:profiles!ekip_id(full_name)')
      .eq('project_id', selectedProjectId)
      .eq('status', 'beklemede')
      .order('work_date', { ascending: false })

    if (filterProfileId) {
      q = q.or(`personel_id.eq.${filterProfileId},ekip_id.eq.${filterProfileId}`)
    }
    const { data } = await q
    setLogs(data || [])
    setLoading(false)
  }, [selectedProjectId, filterProfileId])

  useEffect(() => {
    if (selectedProjectId) {
      loadLogs()
    } else {
      setLogs([])
    }
  }, [selectedProjectId, loadLogs])

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/work-logs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'onayla' }),
    })
    if (res.ok) {
      router.refresh()
      loadLogs()
      if (selectedProjectId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProjectId ? { ...p, count: Math.max(0, p.count - 1) } : p
          )
        )
      }
    } else {
      const d = await res.json()
      alert(d.error || 'Onaylama başarısız')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu iş kaydını silmek istediğinize emin misiniz?')) return
    const res = await fetch(`/api/work-logs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
      loadLogs()
      if (selectedProjectId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProjectId ? { ...p, count: Math.max(0, p.count - 1) } : p
          )
        )
      }
    } else {
      const d = await res.json()
      alert(d.error || 'Silme başarısız')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLog) return
    const res = await fetch(`/api/work-logs/${editLog.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        work_date: editForm.work_date,
        work_type: editForm.work_type,
        description: editForm.description,
        work_quantity: editForm.work_quantity ? parseInt(editForm.work_quantity, 10) : null,
      }),
    })
    if (res.ok) {
      setEditLog(null)
      router.refresh()
      loadLogs()
    } else {
      const d = await res.json()
      alert(d.error || 'Güncelleme başarısız')
    }
  }

  const openEdit = (log: WorkLog) => {
    setEditLog(log)
    setEditForm({
      work_date: log.work_date,
      work_type: log.work_type,
      description: log.description,
      work_quantity: log.work_quantity?.toString() || '',
    })
  }

  const getAssigneeName = (log: WorkLog) => {
    if (log.personel_id && log.personel?.full_name) return log.personel.full_name
    if (log.ekip_id && log.ekip?.full_name) return log.ekip.full_name
    return '-'
  }

  const assigneeOptions = [...(currentAdmin ? [{ id: currentAdmin.id, full_name: currentAdmin.full_name, role: currentAdmin.role }] : []), ...profiles]

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.assignee_id) {
      alert('Personel veya ekip seçin.')
      return
    }
    const assignee = assigneeOptions.find((p) => p.id === addForm.assignee_id)
    if (!assignee) return
    const personel_id = assignee.role === 'ekip' ? null : addForm.assignee_id
    const ekip_id = assignee.role === 'ekip' ? addForm.assignee_id : null

    setAddLoading(true)
    const res = await fetch('/api/work-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: addForm.project_id,
        city_id: addForm.city_id || null,
        personel_id,
        ekip_id,
        work_date: addForm.work_date,
        work_type: addForm.work_type,
        description: addForm.description,
        work_quantity: addForm.work_quantity || null,
      }),
    })
    setAddLoading(false)
    if (res.ok) {
      setShowAddForm(false)
      setAddForm({ project_id: '', city_id: '', assignee_id: currentAdmin?.id || '', work_date: new Date().toISOString().split('T')[0], work_type: 'kurulum', description: '', work_quantity: '' })
      router.refresh()
      loadLogs()
      if (selectedProjectId && addForm.project_id === selectedProjectId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProjectId ? { ...p, count: p.count + 1 } : p
          )
        )
      } else if (addForm.project_id) {
        const proj = allProjects.find((p) => p.id === addForm.project_id)
        if (proj && !projects.some((p) => p.id === proj.id)) {
          setProjects((prev) => [...prev, { id: proj.id, name: proj.name, count: 1 }])
        } else if (proj) {
          setProjects((prev) =>
            prev.map((p) => (p.id === proj.id ? { ...p, count: p.count + 1 } : p))
          )
        }
      }
    } else {
      const d = await res.json()
      alert(d.error || 'İş eklenirken hata oluştu')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setAddForm((f) => ({ ...f, assignee_id: currentAdmin?.id || '' }))
            setShowAddForm(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          İş Ekle
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedProjectId(p.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedProjectId === p.id
                ? 'border-[#3c8dbc] bg-[#3c8dbc]/5 shadow-md'
                : 'border-[#e3e6f0] bg-white hover:border-[#3c8dbc]/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#3c8dbc]" />
              <span className="font-medium text-[#333]">{p.name}</span>
            </div>
            <p className="text-sm text-[#555] mt-1">{p.count} bekleyen iş</p>
          </button>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-12 text-center text-[#555]">
          Onay bekleyen iş kaydı yok.
        </div>
      )}

      {selectedProjectId && (
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="font-semibold text-[#333]">
              {projects.find((p) => p.id === selectedProjectId)?.name} - İş Kayıtları
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#555]">Personel/Ekip:</label>
              <select
                value={filterProfileId}
                onChange={(e) => setFilterProfileId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#d2d6de] text-sm"
              >
                <option value="">Tümü</option>
                {profiles.map((pr) => (
                  <option key={pr.id} value={pr.id}>{pr.full_name} ({pr.role})</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-[#555] py-8 text-center">Yükleniyor...</p>
          ) : logs.length === 0 ? (
            <p className="text-[#555] py-8 text-center">Bu projede bekleyen iş kaydı yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f9fc] border-b border-[#e3e6f0]">
                    <th className="text-left p-3 text-sm font-semibold text-[#333]">Tarih</th>
                    <th className="text-left p-3 text-sm font-semibold text-[#333]">İş Tipi</th>
                    <th className="text-left p-3 text-sm font-semibold text-[#333]">Personel/Ekip</th>
                    <th className="text-left p-3 text-sm font-semibold text-[#333]">Adet</th>
                    <th className="text-left p-3 text-sm font-semibold text-[#333]">Açıklama</th>
                    <th className="text-left p-3 text-sm font-semibold text-[#333]">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-[#e3e6f0] hover:bg-[#f8f9fc]">
                      <td className="p-3 text-sm text-[#555]">{log.work_date}</td>
                      <td className="p-3 text-sm">{workTypes[log.work_type] || log.work_type}</td>
                      <td className="p-3 text-sm">{getAssigneeName(log)}</td>
                      <td className="p-3 text-sm">{log.work_quantity ?? '-'}</td>
                      <td className="p-3 text-sm text-[#555] max-w-[200px] truncate">{log.description}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailLog(log)}
                            className="p-1.5 rounded hover:bg-[#3c8dbc]/10 text-[#3c8dbc]"
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(log)}
                            className="p-1.5 rounded hover:bg-[#f39c12]/10 text-[#f39c12]"
                            title="Düzelt"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(log.id)}
                            className="p-1.5 rounded hover:bg-[#dd4b39]/10 text-[#dd4b39]"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(log.id)}
                            className="p-1.5 rounded hover:bg-[#00a65a]/10 text-[#00a65a]"
                            title="Onayla"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detay Modal */}
      {detailLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailLog(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-[#333] mb-4">İş Kaydı Detayı</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-[#555]">Proje</dt><dd className="font-medium">{detailLog.project?.name || '-'}</dd></div>
              <div><dt className="text-[#555]">İl</dt><dd className="font-medium">{detailLog.city?.name || '-'}</dd></div>
              <div><dt className="text-[#555]">Tarih</dt><dd className="font-medium">{detailLog.work_date}</dd></div>
              <div><dt className="text-[#555]">İş Tipi</dt><dd className="font-medium">{workTypes[detailLog.work_type] || detailLog.work_type}</dd></div>
              <div><dt className="text-[#555]">Personel/Ekip</dt><dd className="font-medium">{getAssigneeName(detailLog)}</dd></div>
              <div><dt className="text-[#555]">İş Adedi</dt><dd className="font-medium">{detailLog.work_quantity ?? '-'}</dd></div>
              <div><dt className="text-[#555]">Açıklama</dt><dd className="font-medium whitespace-pre-wrap">{detailLog.description}</dd></div>
            </dl>
            <button onClick={() => setDetailLog(null)} className="mt-6 px-4 py-2 rounded-lg bg-[#3c8dbc] text-white font-medium hover:bg-[#367fa9]">Kapat</button>
          </div>
        </div>
      )}

      {/* Düzenle Modal */}
      {editLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditLog(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-[#333] mb-4">İş Kaydını Düzenle</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">İş Tarihi *</label>
                <input type="date" value={editForm.work_date} onChange={(e) => setEditForm({ ...editForm, work_date: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">İş Tipi</label>
                <select value={editForm.work_type} onChange={(e) => setEditForm({ ...editForm, work_type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de]">
                  {Object.entries(workTypes).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Açıklama *</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">İş Adedi</label>
                <input type="number" min="1" value={editForm.work_quantity} onChange={(e) => setEditForm({ ...editForm, work_quantity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de]" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2.5 rounded-lg bg-[#3c8dbc] text-white font-medium hover:bg-[#367fa9]">Kaydet</button>
                <button type="button" onClick={() => setEditLog(null)} className="px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc]">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* İş Ekle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-[#333] mb-4">Yeni İş Kaydı Ekle</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Proje *</label>
                <select value={addForm.project_id} onChange={(e) => setAddForm({ ...addForm, project_id: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] bg-white">
                  <option value="">Seçin</option>
                  {allProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">İl *</label>
                <select value={addForm.city_id} onChange={(e) => setAddForm({ ...addForm, city_id: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] bg-white">
                  <option value="">Seçin</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Personel/Ekip *</label>
                <select value={addForm.assignee_id} onChange={(e) => setAddForm({ ...addForm, assignee_id: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] bg-white">
                  <option value="">Seçin</option>
                  {assigneeOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.role === 'admin' ? 'Admin' : p.role === 'personel' ? 'Personel' : 'Ekip'})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">İş Tarihi *</label>
                  <input type="date" value={addForm.work_date} onChange={(e) => setAddForm({ ...addForm, work_date: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1">İş Tipi</label>
                  <select value={addForm.work_type} onChange={(e) => setAddForm({ ...addForm, work_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] bg-white">
                    {Object.entries(workTypes).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Açıklama *</label>
                <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} required rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">İş Adedi</label>
                <input type="number" min="1" value={addForm.work_quantity} onChange={(e) => setAddForm({ ...addForm, work_quantity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de]" placeholder="Opsiyonel" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={addLoading} className="px-4 py-2.5 rounded-lg bg-[#3c8dbc] text-white font-medium hover:bg-[#367fa9] disabled:opacity-50">
                  {addLoading ? 'Ekleniyor...' : 'Ekle'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc]">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
