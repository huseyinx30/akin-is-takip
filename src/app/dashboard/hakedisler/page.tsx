import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, Pencil } from 'lucide-react'
import { HakedisSilButton } from './HakedisSilButton'

export default async function HakedislerPage() {
  const supabase = await createClient()
  const [{ data: payments }, { data: invoicesData }] = await Promise.all([
    supabase
      .from('progress_payments')
      .select('*, projects(name, companies(name)), invoices(invoice_no, total_amount, companies(name))')
      .order('payment_date', { ascending: false }),
    supabase.from('invoices').select('total_amount'),
  ])

  const toplamKesilenFatura = (invoicesData || []).reduce((s, i) => s + Number(i.total_amount), 0)
  const toplamHakedis = (payments || [])
    .filter((p) => p.invoices)
    .reduce((s, p) => s + Number(p.amount), 0)
  const kalanTutar = toplamKesilenFatura - toplamHakedis

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Hakedişler</h1>
          <p className="text-[#555] text-sm mt-0.5">Hakediş listesi</p>
        </div>
        <Link
          href="/dashboard/hakedisler/yeni"
          className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
        >
          + Yeni Hakediş
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#00a65a]/20 flex items-center justify-center">
              <span className="text-sm font-bold text-[#00a65a]">₺</span>
            </div>
            <div>
              <p className="text-[#555] text-sm">Toplam Kesilen Fatura Tutarı</p>
              <p className="text-xl font-bold text-[#333]">{toplamKesilenFatura.toLocaleString('tr-TR')} ₺</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#3c8dbc]/20 flex items-center justify-center">
              <span className="text-sm font-bold text-[#3c8dbc]">₺</span>
            </div>
            <div>
              <p className="text-[#555] text-sm">Toplam Hakediş Yapılan</p>
              <p className="text-xl font-bold text-[#333]">{toplamHakedis.toLocaleString('tr-TR')} ₺</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kalanTutar >= 0 ? 'bg-[#f39c12]/20' : 'bg-[#dd4b39]/20'}`}>
              <span className={`text-sm font-bold ${kalanTutar >= 0 ? 'text-[#f39c12]' : 'text-[#dd4b39]'}`}>₺</span>
            </div>
            <div>
              <p className="text-[#555] text-sm">Kalan Tutar</p>
              <p className={`text-xl font-bold ${kalanTutar >= 0 ? 'text-[#333]' : 'text-[#dd4b39]'}`}>
                {kalanTutar.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fc] border-b border-[#e3e6f0]">
              <th className="text-left p-4 text-[#333] font-semibold">Firma / Fatura</th>
              <th className="text-left p-4 text-[#333] font-semibold">Fatura Tutarı</th>
              <th className="text-left p-4 text-[#333] font-semibold">Tarih</th>
              <th className="text-left p-4 text-[#333] font-semibold">Tutar</th>
              <th className="text-left p-4 text-[#333] font-semibold">Açıklama</th>
              <th className="text-left p-4 text-[#333] font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((p) => (
              <tr key={p.id} className="border-b border-[#e3e6f0] hover:bg-[#f8f9fc]">
                <td className="p-4 text-[#333] font-medium">
                  {p.invoices
                    ? `${p.invoices.companies?.name || '-'} • Fatura ${p.invoices.invoice_no || '-'}`
                    : p.projects
                    ? `${p.projects.companies?.name || '-'} • ${p.projects.name || '-'}`
                    : '-'}
                </td>
                <td className="p-4 text-[#555]">
                  {p.invoices?.total_amount != null
                    ? `${Number(p.invoices.total_amount).toLocaleString('tr-TR')} ₺`
                    : '-'}
                </td>
                <td className="p-4 text-[#555]">{p.payment_date}</td>
                <td className="p-4 text-[#555]">{Number(p.amount).toLocaleString('tr-TR')} ₺</td>
                <td className="p-4 text-[#555] text-sm">{p.description || '-'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/hakedisler/${p.id}`} className="p-1.5 rounded hover:bg-[#3c8dbc]/10 text-[#3c8dbc]" title="Görüntüle">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/dashboard/hakedisler/${p.id}?edit=1`} className="p-1.5 rounded hover:bg-[#f39c12]/10 text-[#f39c12]" title="Düzenle">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <HakedisSilButton hakedisId={p.id} hakedisTutar={p.amount} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!payments || payments.length === 0) && (
          <div className="p-12 text-center text-[#555]">Henüz hakediş eklenmemiş.</div>
        )}
      </div>
    </div>
  )
}
