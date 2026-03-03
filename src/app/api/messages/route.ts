import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === 'true'
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  let query = supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('receiver_id', profile.id).is('read_at', null)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', profile.id)
    .is('read_at', null)

  return NextResponse.json({ messages: data || [], unreadCount: count || 0 })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).single()
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Sadece admin mesaj gönderebilir' }, { status: 403 })

  const body = await req.json()
  const { receiver_id, content } = body as { receiver_id: string; content: string }
  if (!receiver_id || !content?.trim()) return NextResponse.json({ error: 'Alıcı ve mesaj gerekli' }, { status: 400 })

  const { data: msg, error } = await supabase
    .from('messages')
    .insert([{ sender_id: profile.id, receiver_id, content: content.trim() }])
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('notifications').insert([{
    profile_id: receiver_id,
    type: 'mesaj',
    title: 'Yeni Mesaj',
    body: content.trim().slice(0, 100) + (content.length > 100 ? '...' : ''),
    link_url: '/dashboard/mesajlar',
    related_id: msg.id,
  }])

  return NextResponse.json({ success: true, id: msg.id })
}
