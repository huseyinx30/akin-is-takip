import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FirmaIslemler } from '@/components/FirmaIslemler'

export default async function FirmalarPage() {
  const supabase = await createClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Firmalar</h1>
          <p className="text-[#555] text-sm">Firma listesi</p>
        </div>
        <Link
          href="/dashboard/firmalar/yeni"
          className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
        >
          + Yeni Firma
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fc] border-b border-[#e3e6f0]">
              <th className="text-left p-4 text-[#333] font-semibold">Firma Adı</th>
              <th className="text-left p-4 text-[#333] font-semibold">Vergi No</th>
              <th className="text-left p-4 text-[#333] font-semibold">Telefon</th>
              <th className="text-left p-4 text-[#333] font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {companies?.map((company) => (
              <tr key={company.id} className="border-b border-[#e3e6f0] hover:bg-[#f8f9fc]">
                <td className="p-4">
                  <Link href={`/dashboard/firmalar/${company.id}`} className="text-[#3c8dbc] hover:underline font-medium">
                    {company.name}
                  </Link>
                </td>
                <td className="p-4 text-[#555]">{company.tax_number || '-'}</td>
                <td className="p-4 text-[#555]">{company.phone || '-'}</td>
                <td className="p-4">
                  <FirmaIslemler firmaId={company.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!companies || companies.length === 0) && (
          <div className="p-12 text-center text-[#555]">Henüz firma eklenmemiş.</div>
        )}
      </div>
    </div>
  )
}
