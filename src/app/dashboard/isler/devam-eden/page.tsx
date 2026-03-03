import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { DevamEdenIslerClient } from './DevamEdenIslerClient'

export const dynamic = 'force-dynamic'

export default async function DevamEdenIslerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: projectsWithCount } = await supabase
    .from('work_logs')
    .select('project_id')
    .eq('status', 'beklemede')

  const projectIds = [...new Set((projectsWithCount || []).map((w) => w.project_id))]
  let projects: { id: string; name: string; count: number }[] = []

  if (projectIds.length > 0) {
    const { data: projData } = await supabase.from('projects').select('id, name').in('id', projectIds).order('name')
    const countMap = (projectsWithCount || []).reduce((acc, w) => {
      acc[w.project_id] = (acc[w.project_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    projects = (projData || []).map((p) => ({ ...p, count: countMap[p.id] || 0 }))
  }

  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').in('role', ['personel', 'ekip']).order('full_name')

  const [{ data: allProjects }, { data: cities }] = await Promise.all([
    supabase.from('projects').select('id, name, city_id').eq('status', 'aktif').order('name'),
    supabase.from('cities').select('id, name').order('name'),
  ])

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-[#333]">Devam Eden İşler</h1>
        <p className="text-[#555] text-sm mt-0.5">Onay bekleyen iş kayıtları (projelere göre)</p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-48 bg-[#f8f9fc] rounded-lg" />}>
        <DevamEdenIslerClient
          initialProjects={projects}
          profiles={profiles || []}
          allProjects={allProjects || []}
          cities={cities || []}
        />
      </Suspense>
    </div>
  )
}
