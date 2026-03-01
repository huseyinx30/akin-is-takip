import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { OnayBekleyenHarcamalarListe } from '@/components/OnayBekleyenHarcamalarListe'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

export default async function OnayBekleyenHarcamalarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user?.id ?? '').single()
  if (profile?.role !== 'admin') return null

  const [
    { data: personelExpenses },
    { data: ekipExpenses },
    { data: profiles },
  ] = await Promise.all([
    supabase.from('personnel_expenses').select('*').eq('status', 'beklemede').order('expense_date', { ascending: false }),
    supabase.from('team_expenses').select('*').eq('status', 'beklemede').order('expense_date', { ascending: false }),
    supabase.from('profiles').select('id, full_name'),
  ])
  const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]))

  const personelList = (personelExpenses || []).map((e) => ({ ...e, type: 'personnel' as const, detayUrl: `/dashboard/personeller/${e.personel_id}`, profile: { full_name: profileMap.get(e.personel_id) || '-' } }))
  const ekipList = (ekipExpenses || []).map((e) => ({ ...e, type: 'team' as const, detayUrl: `/dashboard/ekipler/${e.ekip_id}`, profile: { full_name: profileMap.get(e.ekip_id) || '-' } }))
  const allExpenses = [...personelList, ...ekipList].sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())

  const totalCount = allExpenses.length
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageExpenses = allExpenses.slice(start, start + PAGE_SIZE)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#333]">Onay Bekleyen Harcamalar</h1>
        <p className="text-[#555] text-sm mt-0.5">
          {totalCount} adet harcama onay bekliyor
          {totalPages > 1 && ` • Sayfa ${safePage} / ${totalPages} (${start + 1}-${Math.min(start + PAGE_SIZE, totalCount)} arası gösteriliyor)`}
        </p>
      </div>

      <OnayBekleyenHarcamalarListe expenses={pageExpenses} />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link
            href={safePage > 1 ? `/dashboard/onay-bekleyen-harcamalar?page=${safePage - 1}` : '#'}
            className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-[#d2d6de] text-[#333] font-medium ${
              safePage <= 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-[#f8f9fc]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Önceki
          </Link>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/dashboard/onay-bekleyen-harcamalar?page=${p}`}
                className={`min-w-[2.5rem] py-2 px-3 rounded-lg text-center font-medium ${
                  p === safePage ? 'bg-[#3c8dbc] text-white' : 'border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc]'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
          <Link
            href={safePage < totalPages ? `/dashboard/onay-bekleyen-harcamalar?page=${safePage + 1}` : '#'}
            className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-[#d2d6de] text-[#333] font-medium ${
              safePage >= totalPages ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-[#f8f9fc]'
            }`}
          >
            Sonraki <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
