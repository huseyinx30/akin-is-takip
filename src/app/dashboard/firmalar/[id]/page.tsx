import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { WhatsAppLink } from '@/components/WhatsAppLink'

export default async function FirmaDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: company } = await supabase.from('companies').select('*').eq('id', id).single()

  if (!company) return <div className="p-8 text-[#555]">Firma bulunamadı.</div>

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/firmalar" className="text-[#3c8dbc] hover:underline mb-2 inline-block font-medium">
          ← Firmalara dön
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#333]">{company.name}</h1>
            <p className="text-[#555] text-sm mt-0.5">Firma detayı</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/firmalar/${id}/duzenle`}
              className="px-4 py-2 rounded-lg bg-[#f39c12] hover:bg-[#e08e0b] text-white font-medium"
            >
              Düzenle
            </Link>
            {company.phone && (
              <WhatsAppLink phone={company.phone}>
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#00a65a] hover:bg-[#008d4c] text-white font-medium">
                  WhatsApp
                </span>
              </WhatsAppLink>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-[#555]">Vergi No</dt>
            <dd className="mt-1 text-[#333]">{company.tax_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#555]">Vergi Dairesi</dt>
            <dd className="mt-1 text-[#333]">{company.tax_office || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#555]">Telefon</dt>
            <dd className="mt-1 text-[#333]">{company.phone || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#555]">E-posta</dt>
            <dd className="mt-1 text-[#333]">{company.email || '-'}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-[#555]">Adres</dt>
            <dd className="mt-1 text-[#333]">{company.address || '-'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
