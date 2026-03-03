import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { MesajListe } from './MesajListe'
import { MesajGonder } from './MesajGonder'

export const dynamic = 'force-dynamic'

export default async function MesajlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: profile } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).single()
  if (!profile) redirect('/dashboard')

  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .order('created_at', { ascending: false })

  let profiles: { id: string; full_name: string; role: string }[] = []
  if (profile.role === 'admin') {
    const { data } = await supabase.from('profiles').select('id, full_name, role').in('role', ['personel', 'ekip']).order('full_name')
    profiles = data || []
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Mesajlar</h1>
          <p className="text-[#555] text-sm mt-0.5">Gelen ve giden mesajlarınız</p>
        </div>
        {profile.role === 'admin' && <MesajGonder profiles={profiles} />}
      </div>

      <Suspense fallback={<div className="animate-pulse h-48 bg-[#f8f9fc] rounded-lg" />}>
        <MesajListe messages={msgError ? [] : (messages || [])} currentProfileId={profile.id} />
      </Suspense>
    </div>
  )
}
