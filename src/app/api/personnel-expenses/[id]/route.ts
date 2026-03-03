import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sadece admin harcama silebilir' }, { status: 403 })

  const { data: expense } = await supabase.from('personnel_expenses').select('id, status').eq('id', id).single()
  if (!expense) return NextResponse.json({ error: 'Harcama bulunamadı' }, { status: 404 })
  if (expense.status !== 'onaylandi') return NextResponse.json({ error: 'Sadece onaylanan harcamalar silinebilir' }, { status: 400 })

  const { error } = await supabase.from('personnel_expenses').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
