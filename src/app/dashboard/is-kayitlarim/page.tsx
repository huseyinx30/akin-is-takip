'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    project_id: '',
    city_id: '',
    work_date: new Date().toISOString().split('T')[0],
    work_type: 'kurulum',
    description: '',
    hours: '',
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
        supabase.from('projects').select('id, name').eq('status', 'aktif').order('name'),
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
      ...form,
      hours: form.hours ? parseFloat(form.hours) : null,
    }])

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setForm({ project_id: '', city_id: '', work_date: new Date().toISOString().split('T')[0], work_type: 'kurulum', description: '', hours: '' })
    setShowForm(false)
    const { data } = await supabase.from('work_logs').select('*, project:projects(name), city:cities(name)').eq(idField, profile.id).order('work_date', { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

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

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md border border-[#e3e6f0] space-y-4">
          {error && <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Proje *</label>
              <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
                <option value="">Seçin</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">İl *</label>
              <select value={form.city_id} onChange={(e) => setForm({ ...form, city_id: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white">
                <option value="">Seçin</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
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
            <label className="block text-sm font-medium text-[#333] mb-1">Saat</label>
            <input type="number" step="0.5" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]" />
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
                <div className="text-[#555] text-sm mt-1">{log.work_date} • {log.work_type}</div>
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
