import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BildirimListe } from './BildirimListe'

export const dynamic = 'force-dynamic'

export default async function BildirimlerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) redirect('/dashboard')

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profile.id)
    .neq('type', 'mesaj')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Bildirimler</h1>
        <p className="text-[#555] text-sm mt-0.5">Harcama onay ve red bildirimleri</p>
      </div>

      <BildirimListe initialNotifications={error ? [] : (notifications || [])} />
    </div>
  )
}
