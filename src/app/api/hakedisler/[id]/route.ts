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

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sadece admin düzenleyebilir' }, { status: 403 })

  const body = await req.json()
  const { invoice_id, project_id, amount, payment_date, description } = body

  const updates: Record<string, unknown> = {}
  if (invoice_id !== undefined) updates.invoice_id = invoice_id || null
  if (project_id !== undefined) updates.project_id = project_id || null
  if (amount !== undefined) updates.amount = amount
  if (payment_date !== undefined) updates.payment_date = payment_date
  if (description !== undefined) updates.description = description || null

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 })

  const { error } = await supabase.from('progress_payments').update(updates).eq('id', id)
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

  const { error } = await supabase.from('progress_payments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
