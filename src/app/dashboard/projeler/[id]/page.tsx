import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProjeDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user?.id ?? '').single()
  const isAdmin = profile?.role === 'admin'

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      companies(name),
      cities(name)
    `)
    .eq('id', id)
    .single()

  if (!project) return <div className="p-8 text-[#555]">Proje bulunamadı.</div>

  const statusLabels: Record<string, string> = {
    aktif: 'Aktif',
    tamamlandi: 'Tamamlandı',
    beklemede: 'Beklemede',
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/projeler" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">
          ← Projelere dön
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#333]">{project.name}</h1>
            <p className="text-[#555] text-sm mt-0.5">Proje detayı</p>
          </div>
          {isAdmin && (
            <Link
              href={`/dashboard/projeler/${id}/duzenle`}
              className="px-4 py-2 rounded-lg bg-[#f39c12] hover:bg-[#e08e0b] text-white font-medium"
            >
              Düzenle
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <div className="flex items-center gap-2 mb-6">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              project.status === 'aktif'
                ? 'bg-[#00a65a]/20 text-[#00a65a]'
                : project.status === 'tamamlandi'
                ? 'bg-[#555]/20 text-[#555]'
                : 'bg-[#f39c12]/20 text-[#f39c12]'
            }`}
          >
            {statusLabels[project.status] || project.status}
          </span>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-[#555]">Firma</dt>
            <dd className="mt-1 text-[#333]">{project.companies?.name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#555]">İl</dt>
            <dd className="mt-1 text-[#333]">{project.cities?.name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#555]">Başlangıç Tarihi</dt>
            <dd className="mt-1 text-[#333]">{project.start_date || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#555]">Bitiş Tarihi</dt>
            <dd className="mt-1 text-[#333]">{project.end_date || '-'}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-[#555]">Açıklama</dt>
            <dd className="mt-1 text-[#333] whitespace-pre-wrap">{project.description || '-'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
