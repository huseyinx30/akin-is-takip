import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, id').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  const body = await req.json()
  const { id, type, action } = body as { id: string; type: 'personnel' | 'team'; action: 'onayla' | 'reddet' }
  if (!id || !type || !action) return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })

  const table = type === 'personnel' ? 'personnel_expenses' : 'team_expenses'
  const updateData = action === 'onayla'
    ? { status: 'onaylandi', approved_by: profile.id, approved_at: new Date().toISOString() }
    : { status: 'reddedildi' }

  const { error } = await supabase.from(table).update(updateData).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
