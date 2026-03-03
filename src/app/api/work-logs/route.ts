import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sadece admin iş ekleyebilir' }, { status: 403 })

  const body = await req.json()
  const { project_id, city_id, personel_id, ekip_id, work_date, work_type, description, work_quantity } = body

  if (!project_id || !work_date || !work_type || !description) {
    return NextResponse.json({ error: 'Proje, tarih, iş tipi ve açıklama zorunludur' }, { status: 400 })
  }

  if (!personel_id && !ekip_id) {
    return NextResponse.json({ error: 'Personel veya ekip seçilmelidir' }, { status: 400 })
  }

  if (personel_id && ekip_id) {
    return NextResponse.json({ error: 'Sadece personel veya sadece ekip seçin' }, { status: 400 })
  }

  const insertData = {
    project_id,
    city_id: city_id || null,
    personel_id: personel_id || null,
    ekip_id: ekip_id || null,
    work_date,
    work_type,
    description,
    work_quantity: work_quantity ? parseInt(work_quantity, 10) : null,
    status: 'beklemede',
  }

  const { error } = await supabase.from('work_logs').insert([insertData])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
