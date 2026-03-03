import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 })

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('messages')
    .update({ read_at: now })
    .eq('id', id)
    .eq('receiver_id', profile.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('notifications').update({ read_at: now }).eq('type', 'mesaj').eq('related_id', id).eq('profile_id', profile.id)

  return NextResponse.json({ ok: true })
}
