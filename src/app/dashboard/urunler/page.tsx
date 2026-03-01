import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function UrunlerPage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*').order('name')

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#333]">Ürünler & Mal Alımı</h1>
          <p className="text-[#555] text-sm mt-0.5">Ürün listesi</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/urunler/yeni"
            className="px-4 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium"
          >
            + Yeni Ürün
          </Link>
          <Link
            href="/dashboard/urunler/alim"
            className="px-4 py-2 rounded-lg border border-[#d2d6de] text-[#333] hover:bg-[#f8f9fc] font-medium"
          >
            Mal Alımı
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-[#e3e6f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fc] border-b border-[#e3e6f0]">
              <th className="text-left p-4 text-[#333] font-semibold">Ürün</th>
              <th className="text-left p-4 text-[#333] font-semibold">Alış Fiyatı</th>
              <th className="text-left p-4 text-[#333] font-semibold">Satış Fiyatı</th>
              <th className="text-left p-4 text-[#333] font-semibold">Stok</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-[#e3e6f0] hover:bg-[#f8f9fc]">
                <td className="p-4 text-[#333] font-medium">{p.name}</td>
                <td className="p-4 text-[#555]">{Number(p.purchase_price).toLocaleString('tr-TR')} ₺</td>
                <td className="p-4 text-[#555]">{Number(p.sale_price).toLocaleString('tr-TR')} ₺</td>
                <td className="p-4 text-[#555]">{p.stock ?? '-'} {p.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <div className="p-12 text-center text-[#555]">Henüz ürün eklenmemiş.</div>
        )}
      </div>
    </div>
  )
}
