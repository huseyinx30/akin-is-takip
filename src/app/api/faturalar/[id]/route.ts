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
  const { company_id, invoice_no, invoice_date, total_amount, currency, status, notes } = body

  const updates: Record<string, unknown> = {}
  if (company_id !== undefined) updates.company_id = company_id
  if (invoice_no !== undefined) updates.invoice_no = invoice_no
  if (invoice_date !== undefined) updates.invoice_date = invoice_date
  if (total_amount !== undefined) updates.total_amount = total_amount
  if (currency !== undefined) updates.currency = currency
  if (status !== undefined) updates.status = status
  if (notes !== undefined) updates.notes = notes

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 })

  const { error } = await supabase.from('invoices').update(updates).eq('id', id)
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

  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
