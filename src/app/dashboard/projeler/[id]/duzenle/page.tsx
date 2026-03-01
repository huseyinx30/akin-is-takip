'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ProjeDuzenlePage() {
  const params = useParams()
  const id = params.id as string
  const [form, setForm] = useState({
    company_id: '',
    city_id: '',
    name: '',
    description: '',
    status: 'aktif',
    start_date: '',
    end_date: '',
  })
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])
  const [personeller, setPersoneller] = useState<{ id: string; full_name: string }[]>([])
  const [ekipler, setEkipler] = useState<{ id: string; full_name: string }[]>([])
  const [assignments, setAssignments] = useState<{ profile_id: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const [projRes, companiesRes, citiesRes, personelRes, ekipRes, assignRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('companies').select('id, name').order('name'),
        supabase.from('cities').select('id, name').order('name'),
        supabase.from('profiles').select('id, full_name').eq('role', 'personel').order('full_name'),
        supabase.from('profiles').select('id, full_name').eq('role', 'ekip').order('full_name'),
        supabase.from('project_assignments').select('profile_id').eq('project_id', id),
      ])
      setCompanies(companiesRes.data || [])
      setCities(citiesRes.data || [])
      setPersoneller(personelRes.data || [])
      setEkipler(ekipRes.data || [])
      setAssignments((assignRes.data || []).map((a) => ({ profile_id: a.profile_id })))
      if (projRes.data) {
        const p = projRes.data
        setForm({
          company_id: p.company_id || '',
          city_id: p.city_id || '',
          name: p.name || '',
          description: p.description || '',
          status: p.status || 'aktif',
          start_date: p.start_date || '',
          end_date: p.end_date || '',
        })
      }
      setLoadingData(false)
    }
    load()
  }, [id, supabase])

  const addAssignment = async (profileId: string) => {
    const { error } = await supabase.from('project_assignments').insert([{ project_id: id, profile_id: profileId }])
    if (!error) setAssignments((prev) => [...prev, { profile_id: profileId }])
  }

  const removeAssignment = async (profileId: string) => {
    const { error } = await supabase.from('project_assignments').delete().eq('project_id', id).eq('profile_id', profileId)
    if (!error) setAssignments((prev) => prev.filter((a) => a.profile_id !== profileId))
  }

  const getProfileName = (profileId: string) => {
    const p = personeller.find((x) => x.id === profileId)
    const e = ekipler.find((x) => x.id === profileId)
    return p?.full_name || e?.full_name || profileId
  }

  const allProfiles = [...personeller, ...ekipler]
  const unassigned = allProfiles.filter((p) => !assignments.some((a) => a.profile_id === p.id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    }

    const { error } = await supabase.from('projects').update(payload).eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/projeler/${id}`)
    router.refresh()
  }

  if (loadingData) return <div className="p-8 text-[#555]">Yükleniyor...</div>

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/projeler" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">
          ← Projelere dön
        </Link>
        <h1 className="text-2xl font-bold text-[#333]">Proje Düzenle</h1>
        <p className="text-[#555] text-sm mt-0.5">Proje bilgilerini güncelleyin</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#dd4b39]/10 border border-[#dd4b39]/30 text-[#dd4b39] text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Firma *</label>
            <select
              value={form.company_id}
              onChange={(e) => setForm({ ...form, company_id: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
            >
              <option value="">Seçin</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">İl</label>
            <select
              value={form.city_id}
              onChange={(e) => setForm({ ...form, city_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
            >
              <option value="">Seçin</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Proje Adı *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              placeholder="Proje adı"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] resize-none"
              placeholder="Açıklama"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Durum</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] bg-white"
            >
              <option value="aktif">Aktif</option>
              <option value="beklemede">Beklemede</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc]"
              />
            </div>
          </div>
          <div className="border-t border-[#e3e6f0] pt-6 mt-6">
            <h3 className="text-lg font-semibold text-[#333] mb-3">Proje Erişim İzinleri</h3>
            <p className="text-sm text-[#555] mb-4">Bu projeyi görebilecek personel ve ekip üyelerini atayın.</p>
            {assignments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {assignments.map((a) => (
                  <span
                    key={a.profile_id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3c8dbc]/10 text-[#3c8dbc] text-sm"
                  >
                    {getProfileName(a.profile_id)}
                    <button
                      type="button"
                      onClick={() => removeAssignment(a.profile_id)}
                      className="ml-1 hover:text-[#dd4b39]"
                      title="Kaldır"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {unassigned.length > 0 ? (
              <select
                className="w-full max-w-xs px-4 py-2 rounded-lg border border-[#d2d6de] text-[#333] focus:outline-none focus:border-[#3c8dbc] bg-white"
                onChange={(e) => {
                  const v = e.target.value
                  if (v) {
                    addAssignment(v)
                    e.target.value = ''
                  }
                }}
              >
                <option value="">Personel veya ekip ekle...</option>
                {unassigned.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-[#555]">Tüm personel ve ekip üyeleri zaten atanmış.</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link
              href={`/dashboard/projeler/${id}`}
              className="px-6 py-2.5 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc] font-medium"
            >
              İptal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
