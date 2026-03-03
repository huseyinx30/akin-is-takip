import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TamamlananIslerClient } from './TamamlananIslerClient'

export const dynamic = 'force-dynamic'

export default async function TamamlananIslerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: workLogs } = await supabase
    .from('work_logs')
    .select('project_id, hakedis_yapildi, work_quantity')
    .eq('status', 'onaylandi')

  const projectIds = [...new Set((workLogs || []).map((w) => w.project_id))]
  let projects: { id: string; name: string; count: number; total_adet: number; hakedis_yapilan: number; hakedis_bekleyen: number }[] = []

  if (projectIds.length > 0) {
    const { data: projData } = await supabase.from('projects').select('id, name').in('id', projectIds).order('name')
    const countMap = (workLogs || []).reduce((acc, w) => {
      if (!acc[w.project_id]) acc[w.project_id] = { total: 0, total_adet: 0, hakedis_yapilan: 0, hakedis_bekleyen: 0 }
      acc[w.project_id].total++
      acc[w.project_id].total_adet += (w.work_quantity ?? 0)
      if (w.hakedis_yapildi) acc[w.project_id].hakedis_yapilan++
      else acc[w.project_id].hakedis_bekleyen++
      return acc
    }, {} as Record<string, { total: number; total_adet: number; hakedis_yapilan: number; hakedis_bekleyen: number }>)
    projects = (projData || []).map((p) => {
      const c = countMap[p.id] || { total: 0, total_adet: 0, hakedis_yapilan: 0, hakedis_bekleyen: 0 }
      return { ...p, count: c.total, total_adet: c.total_adet, hakedis_yapilan: c.hakedis_yapilan, hakedis_bekleyen: c.hakedis_bekleyen }
    })
  }

  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').in('role', ['personel', 'ekip']).order('full_name')

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-[#333]">Tamamlanan İşler</h1>
        <p className="text-[#555] text-sm mt-0.5">Onaylanmış iş kayıtları (projelere göre)</p>
      </div>
      <TamamlananIslerClient
        initialProjects={projects}
        profiles={profiles || []}
      />
    </div>
  )
}
