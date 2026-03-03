'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react'

const workTypes = [
  { value: 'kurulum', label: 'Kurulum' },
  { value: 'montaj', label: 'Montaj' },
  { value: 'servis', label: 'Servis' },
  { value: 'demontaj', label: 'Demontaj' },
]

const statusLabels: Record<string, string> = {
  beklemede: 'Beklemede',
  onaylandi: 'Onaylandı',
  reddedildi: 'Reddedildi',
}

export default function IsKayitlarimPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [profile, setProfile] = useState<{ id: string; role: string } | null>(null)
  const [projects, setProjects] = useState<{ id: string; name: string; city_id: string | null }[]>([])
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    project_id: '',
    city_id: '',
    work_date: new Date().toISOString().split('T')[0],
    work_type: 'kurulum',
    description: '',
    work_quantity: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).single()
      setProfile(prof)
      if (!prof) return

      const idField = prof.role === 'personel' ? 'personel_id' : 'ekip_id'
      const { data: logsData } = await supabase.from('work_logs').select('*, project:projects(name), city:cities(name)').eq(idField, prof.id).order('work_date', { ascending: false })
      setLogs(logsData || [])

      const [{ data: projData }, { data: cityData }] = await Promise.all([
        supabase.from('projects').select('id, name, city_id').eq('status', 'aktif').order('name'),
        supabase.from('cities').select('id, name').order('name'),
      ])
      setProjects(projData || [])
      setCities(cityData || [])
    }
    load()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    setError(null)

    const idField = profile.role === 'personel' ? 'personel_id' : 'ekip_id'

    const { error } = await supabase.from('work_logs').insert([{
      [idField]: profile.id,
      project_id: form.project_id,
      city_id: form.city_id || null,
      work_date: form.work_date,
      work_type: form.work_type,
      description: form.description,
      work_quantity: form.work_quantity ? parseInt(form.work_quantity, 10) : null,
    }])

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setForm({ project_id: '', city_id: '', work_date: new Date().toISOString().split('T')[0], work_type: 'kurulum', description: '', work_quantity: '' })
    setShowForm(false)
    const { data } = await supabase.from('work_logs').select('*, project:projects(name), city:cities(name)').eq(idField, profile.id).order('work_date', { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

  const toplamAdet = logs.reduce((s, l) => s + (l.work_quantity ?? 0), 0)
  const onaylananAdet = logs.filter((l) => l.status === 'onaylandi').reduce((s, l) => s + (l.work_quantity ?? 0), 0)
  const beklemedeAdet = logs.filter((l) => l.status === 'beklemede').reduce((s, l) => s + (l.work_quantity ?? 0), 0)

  if (!profile) return <div className="p-8 text-[#555]">Yükleniyor...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">İş Kayıtlarım</h1>
          <p className="text-[#555] text-sm mt-0.5">Yaptığınız işlerin kayıtları</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
        >
          {showForm ? 'İptal' : '+ Yeni İş Kaydı'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#3c8dbc]/10 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-[#3c8dbc]" />
          </div>
          <div>
            <p className="text-sm text-[#555] font-medium">Toplam Servis Adedi</p>
            <p className="text-2xl font-bold text-[#333] mt-0.5">{toplamAdet}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#00a65a]/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#00a65a]" />
          </div>
          <div>
            <p className="text-sm text-[#00a65a] font-medium">Onaylanan Servis Adedi</p>
            <p className="text-2xl font-bold text-[#00a65a] mt-0.5">{onaylananAdet}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-[#e3e6f0] p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#f39c12]/10 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-[#f39c12]" />
          </div>
          <div>
            <p className="text-sm text-[#f39c12] font-medium">Beklemede Olan Servis Adedi</p>
            <p className="text-2xl font-bold text-[#f39c12] mt-0.5">{beklemedeAdet}</p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md border border-[#e3e6f0] space-y-4">
          {error && <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Proje *</label>
              <select
                value={form.project_id}
                onChange={(e) => {
                  const projectId = e.target.value
                  const proj = projects.find((p) => p.id === projectId)
                  setForm({
                    ...form,
                    project_id: projectId,
                    city_id: proj?.city_id || '',
                  })
                }}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
              >
                <option value="">Seçin</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">İl</label>
              <input
                type="text"
                value={form.project_id ? (cities.find((c) => c.id === form.city_id)?.name || '-') : ''}
                readOnly
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#555] bg-[#f8f9fc] cursor-not-allowed"
                placeholder={form.project_id ? '' : 'Önce proje seçin'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">İş Tarihi *</label>
              <input type="date" value={form.work_date} onChange={(e) => setForm({ ...form, work_date: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">İş Tipi</label>
              <select value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
                {workTypes.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Açıklama *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">İş Adedi *</label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.work_quantity}
              onChange={(e) => setForm({ ...form, work_quantity: e.target.value })}
              required
              placeholder="Yaptığınız iş sayısı"
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
            />
          </div>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-[#333]">{log.project?.name || '-'} • {log.city?.name || '-'}</div>
                <div className="text-[#555] text-sm mt-1">{log.work_date} • {log.work_type}{log.work_quantity != null ? ` • ${log.work_quantity} adet` : ''}</div>
                <p className="text-[#555] mt-2">{log.description}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${log.status === 'onaylandi' ? 'bg-[#00a65a]/15 text-[#00a65a]' : log.status === 'reddedildi' ? 'bg-[#dd4b39]/15 text-[#dd4b39]' : 'bg-[#f39c12]/15 text-[#f39c12]'}`}>
                {statusLabels[log.status] || log.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {logs.length === 0 && !showForm && (
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-12 text-center text-[#555]">
          Henüz iş kaydınız yok.
        </div>
      )}
    </div>
  )
}
