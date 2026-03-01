import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardWrapper } from '@/components/DashboardWrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  const role = (profile?.role || 'personel') as 'admin' | 'personel' | 'ekip'
  const userName = profile?.full_name || user.email || 'Kullanıcı'

  let pendingCount = 0
  let pendingExpenses: { id: string; description: string; amount: number; expense_date: string; type: 'personnel' | 'team'; detayUrl: string; profileName: string }[] = []
  if (role === 'admin') {
    const [
      { data: pExp, count: pCount },
      { data: tExp, count: tCount },
      { data: profiles },
    ] = await Promise.all([
      supabase.from('personnel_expenses').select('id, description, amount, expense_date, personel_id', { count: 'exact' }).eq('status', 'beklemede').order('expense_date', { ascending: false }).limit(5),
      supabase.from('team_expenses').select('id, description, amount, expense_date, ekip_id', { count: 'exact' }).eq('status', 'beklemede').order('expense_date', { ascending: false }).limit(5),
      supabase.from('profiles').select('id, full_name'),
    ])
    pendingCount = (pCount || 0) + (tCount || 0)
    const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]))
    const pList = (pExp || []).map((e) => ({ ...e, type: 'personnel' as const, detayUrl: `/dashboard/personeller/${e.personel_id}`, profileName: profileMap.get(e.personel_id) || '-' }))
    const tList = (tExp || []).map((e) => ({ ...e, type: 'team' as const, detayUrl: `/dashboard/ekipler/${e.ekip_id}`, profileName: profileMap.get(e.ekip_id) || '-' }))
    pendingExpenses = [...pList, ...tList].sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()).slice(0, 5)
  }

  return (
    <DashboardWrapper role={role} userName={userName} pendingCount={pendingCount} pendingExpenses={pendingExpenses}>
      {children}
    </DashboardWrapper>
  )
}
