import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') || 'personel' // personel veya ekip

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', role)
    .order('full_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
