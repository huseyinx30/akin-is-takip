import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, id').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sadece admin düzenleyebilir' }, { status: 403 })

  const body = await req.json()
  const { action, ...updateData } = body as { action?: 'onayla' | 'reddet'; project_id?: string; city_id?: string; work_date?: string; work_type?: string; description?: string; work_quantity?: number }

  let dataToUpdate: Record<string, unknown> = {}

  if (action === 'onayla') {
    dataToUpdate = { status: 'onaylandi', approved_by: profile.id, approved_at: new Date().toISOString() }
  } else if (action === 'reddet') {
    dataToUpdate = { status: 'reddedildi' }
  } else if (Object.keys(updateData).length > 0) {
    if (updateData.project_id !== undefined) dataToUpdate.project_id = updateData.project_id
    if (updateData.city_id !== undefined) dataToUpdate.city_id = updateData.city_id
    if (updateData.work_date !== undefined) dataToUpdate.work_date = updateData.work_date
    if (updateData.work_type !== undefined) dataToUpdate.work_type = updateData.work_type
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description
    if (updateData.work_quantity !== undefined) dataToUpdate.work_quantity = updateData.work_quantity
  }

  if (Object.keys(dataToUpdate).length === 0) return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 })

  const { error } = await supabase.from('work_logs').update(dataToUpdate).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sadece admin silebilir' }, { status: 403 })

  const { error } = await supabase.from('work_logs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
