import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const categoryLabels: Record<string, string> = {
  demirbas: 'Demirbaş',
  giyim: 'Giyim',
  arac_vergi: 'Araç Vergi',
  yakit: 'Yakıt',
  yemek: 'Yemek',
  diger: 'Diğer',
}

export default async function SirketGiderleriPage() {
  const supabase = await createClient()
  const { data: expenses } = await supabase
    .from('company_expenses')
    .select('*')
    .order('expense_date', { ascending: false })

  const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Şirket Giderleri</h1>
          <p className="text-[#555] text-sm mt-0.5">Gider listesi</p>
        </div>
        <Link
          href="/dashboard/sirket-giderleri/yeni"
          className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
        >
          + Yeni Gider
        </Link>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-md border border-[#e3e6f0]">
        <span className="text-[#555]">Toplam Gider: </span>
        <span className="text-2xl font-bold text-[#333]">{total.toLocaleString('tr-TR')} ₺</span>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fc] border-b border-[#e3e6f0]">
              <th className="text-left p-4 text-[#333] font-semibold">Kategori</th>
              <th className="text-left p-4 text-[#333] font-semibold">Açıklama</th>
              <th className="text-left p-4 text-[#333] font-semibold">Tarih</th>
              <th className="text-left p-4 text-[#333] font-semibold">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {expenses?.map((e) => (
              <tr key={e.id} className="border-b border-[#e3e6f0] hover:bg-[#f8f9fc]">
                <td className="p-4 text-[#555]">{categoryLabels[e.category] || e.category}</td>
                <td className="p-4 text-[#333] font-medium">{e.description}</td>
                <td className="p-4 text-[#555]">{e.expense_date}</td>
                <td className="p-4 text-[#555]">{Number(e.amount).toLocaleString('tr-TR')} ₺</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!expenses || expenses.length === 0) && (
          <div className="p-12 text-center text-[#555]">Henüz şirket gideri eklenmemiş.</div>
        )}
      </div>
    </div>
  )
}
