import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: adminProfile } = await supabaseAuth.from('profiles').select('role').eq('user_id', user.id).single()
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Sadece admin ekip silebilir' }, { status: 403 })

  const { data: targetProfile } = await supabaseAuth.from('profiles').select('id, user_id, role').eq('id', id).single()
  if (!targetProfile) return NextResponse.json({ error: 'Ekip bulunamadı' }, { status: 404 })
  if (targetProfile.role !== 'ekip') return NextResponse.json({ error: 'Sadece ekip silinebilir' }, { status: 400 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Supabase yapılandırması eksik (SUPABASE_SERVICE_ROLE_KEY)' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { error } = await supabase.auth.admin.deleteUser(targetProfile.user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
