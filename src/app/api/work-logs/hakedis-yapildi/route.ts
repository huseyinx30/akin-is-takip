import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sadece admin hakediş işaretleyebilir' }, { status: 403 })

  const body = await req.json()
  const { ids } = body as { ids: string[] }
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'En az bir iş kaydı seçilmelidir' }, { status: 400 })
  }

  const { error } = await supabase
    .from('work_logs')
    .update({ hakedis_yapildi: true })
    .in('id', ids)
    .eq('status', 'onaylandi')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, count: ids.length })
}
