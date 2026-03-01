import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ProjeIslemler } from '@/components/ProjeIslemler'

export default async function ProjelerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user?.id ?? '').single()
  const isAdmin = profile?.role === 'admin'

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      companies(name),
      cities(name)
    `)
    .order('created_at', { ascending: false })

  const statusLabels: Record<string, string> = {
    aktif: 'Aktif',
    tamamlandi: 'Tamamlandı',
    beklemede: 'Beklemede',
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Projeler & İşler</h1>
          <p className="text-[#555] text-sm mt-0.5">Proje listesi</p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/projeler/yeni"
            className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
          >
            + Yeni Proje
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
        {projects && projects.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f9fc] border-b border-[#e3e6f0]">
                <th className="text-left p-4 text-[#333] font-semibold">Proje Adı</th>
                <th className="text-left p-4 text-[#333] font-semibold">Firma</th>
                <th className="text-left p-4 text-[#333] font-semibold">İl</th>
                <th className="text-left p-4 text-[#333] font-semibold">Durum</th>
                <th className="text-left p-4 text-[#333] font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-[#e3e6f0] hover:bg-[#f8f9fc]">
                  <td className="p-4">
                    <Link href={`/dashboard/projeler/${project.id}`} className="text-[#3c8dbc] hover:underline font-medium">
                      {project.name}
                    </Link>
                  </td>
                  <td className="p-4 text-[#555]">{project.companies?.name || '-'}</td>
                  <td className="p-4 text-[#555]">{project.cities?.name || '-'}</td>
                  <td className="p-4">
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
                  </td>
                  <td className="p-4">
                    <ProjeIslemler projeId={project.id} isAdmin={isAdmin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-[#555]">Henüz proje eklenmemiş.</div>
        )}
      </div>
    </div>
  )
}
