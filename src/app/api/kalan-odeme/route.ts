import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  const [{ data: invoicesData }, { data: payments }] = await Promise.all([
    supabase.from('invoices').select('total_amount'),
    supabase.from('progress_payments').select('amount, invoice_id'),
  ])

  const toplamKesilenFatura = (invoicesData || []).reduce((s, i) => s + Number(i.total_amount), 0)
  const toplamHakedis = (payments || [])
    .filter((p) => p.invoice_id != null)
    .reduce((s, p) => s + Number(p.amount), 0)
  const kalanTutar = toplamKesilenFatura - toplamHakedis

  return NextResponse.json({ kalanTutar, toplamKesilenFatura, toplamHakedis })
}
