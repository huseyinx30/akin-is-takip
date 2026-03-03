import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { FaturaSilButton } from './FaturaSilButton'

export default async function FaturalarPage() {
  const supabase = await createClient()
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, companies(name)')
    .order('invoice_date', { ascending: false })

  const statusLabels: Record<string, string> = {
    kesildi: 'Kesildi',
    odendi: 'Ödendi',
    beklemede: 'Beklemede',
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Faturalar</h1>
          <p className="text-[#555] text-sm mt-0.5">Fatura listesi</p>
        </div>
        <Link
          href="/dashboard/faturalar/yeni"
          className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
        >
          + Yeni Fatura
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fc] border-b border-[#e3e6f0]">
              <th className="text-left p-4 text-[#333] font-semibold">Fatura No</th>
              <th className="text-left p-4 text-[#333] font-semibold">Firma</th>
              <th className="text-left p-4 text-[#333] font-semibold">Tarih</th>
              <th className="text-left p-4 text-[#333] font-semibold">Tutar</th>
              <th className="text-left p-4 text-[#333] font-semibold">Durum</th>
              <th className="text-left p-4 text-[#333] font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.map((inv) => (
              <tr key={inv.id} className="border-b border-[#e3e6f0] hover:bg-[#f8f9fc]">
                <td className="p-4">
                  <Link href={`/dashboard/faturalar/${inv.id}`} className="text-[#3c8dbc] hover:underline font-medium">
                    {inv.invoice_no}
                  </Link>
                </td>
                <td className="p-4 text-[#555]">{inv.companies?.name || '-'}</td>
                <td className="p-4 text-[#555]">{inv.invoice_date}</td>
                <td className="p-4 text-[#555]">
                  {Number(inv.total_amount).toLocaleString('tr-TR')} {inv.currency}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      inv.status === 'odendi' ? 'bg-[#00a65a]/20 text-[#00a65a]' : 'bg-[#f39c12]/20 text-[#f39c12]'
                    }`}
                  >
                    {statusLabels[inv.status] || inv.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/faturalar/${inv.id}`} className="p-1.5 rounded hover:bg-[#3c8dbc]/10 text-[#3c8dbc]" title="Görüntüle">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/dashboard/faturalar/${inv.id}?edit=1`} className="p-1.5 rounded hover:bg-[#f39c12]/10 text-[#f39c12]" title="Düzenle">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <FaturaSilButton faturaId={inv.id} faturaNo={inv.invoice_no} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!invoices || invoices.length === 0) && (
          <div className="p-12 text-center text-[#555]">Henüz fatura eklenmemiş.</div>
        )}
      </div>
    </div>
  )
}
