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
  let notificationCount = 0
  let messageCount = 0
  let recentNotifications: { id: string; type: string; title: string; body: string | null; link_url: string | null; read_at: string | null; created_at: string }[] = []
  let recentMessages: { id: string; content: string; sender_id: string; receiver_id: string; read_at: string | null; created_at: string }[] = []

  const { data: profileData } = await supabase.from('profiles').select('id').eq('user_id', user!.id).single()

  if (profileData) {
    const [notifRes, notifCountRes, msgRes, msgCountRes] = await Promise.all([
      supabase.from('notifications').select('id, type, title, body, link_url, read_at, created_at').eq('profile_id', profileData.id).neq('type', 'mesaj').is('read_at', null).order('created_at', { ascending: false }).limit(5),
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('profile_id', profileData.id).neq('type', 'mesaj').is('read_at', null),
      supabase.from('messages').select('id, content, sender_id, receiver_id, read_at, created_at').eq('receiver_id', profileData.id).is('read_at', null).order('created_at', { ascending: false }).limit(5),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', profileData.id).is('read_at', null),
    ])
    if (!notifRes.error) {
      notificationCount = notifCountRes.count || 0
      recentNotifications = notifRes.data || []
    }
    if (!msgRes.error) {
      messageCount = msgCountRes.count || 0
      recentMessages = msgRes.data || []
    }
  }

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
    <DashboardWrapper role={role} userName={userName} pendingCount={pendingCount} pendingExpenses={pendingExpenses} notificationCount={notificationCount} messageCount={messageCount} recentNotifications={recentNotifications} recentMessages={recentMessages}>
      {children}
    </DashboardWrapper>
  )
}
